// Set NODE_ENV and JWT_SECRET before any imports
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret-key';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-that-is-long-enough-for-security';

import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(childProcess.exec);

// Internal variable for the Prisma client
let testPrisma: PrismaClient | undefined = undefined;
let isDbSetup = false; // Track if database has been set up

// Function to get the initialized Prisma client
export const getTestPrisma = (): PrismaClient => {
    if (!testPrisma) {
        throw new Error('Test Prisma client not initialized. Did you forget to call setupTestDatabase()?');
    }
    return testPrisma;
};

// Wait for a file to exist (with timeout)
async function waitForFile(path: string, timeoutMs = 3000): Promise<void> {
    const start = Date.now();
    while (!fs.existsSync(path)) {
        if (Date.now() - start > timeoutMs) {
            throw new Error(`File ${path} did not appear within ${timeoutMs}ms`);
        }
        await new Promise(res => setTimeout(res, 100));
    }
}

// Ensure database is set up (only runs once)
export const ensureTestDatabase = async (): Promise<void> => {
    if (!isDbSetup) {
        await setupTestDatabase();
        isDbSetup = true;
    }
};

// Setup function to run before all tests
export const setupTestDatabase = async (): Promise<void> => {
    if (isDbSetup) {
        return; // Already set up
    }
    
    try {
        const dbPath = 'prisma/test.db';
        const absoluteDbPath = `file:${process.cwd()}/${dbPath}`;
        
        // Set the DATABASE_URL for the app and Prisma client
        process.env['DATABASE_URL'] = absoluteDbPath;
        console.log('🗃️  Using DATABASE_URL:', process.env['DATABASE_URL']);
        console.log('🗃️  Current working directory:', process.cwd());
        
        // Remove any old test DB files
        await execAsync('rm -f prisma/test.db prisma/test.db-journal');
        console.log('🧹 Cleaned up old test database files');
        
        // Run migrations from the prisma directory, using a relative path
        console.log('🔄 Running database migrations...');
        await execAsync(`cd prisma && DATABASE_URL="file:./test.db" npx prisma migrate reset --force --skip-seed`);
        
        // Wait for the test DB file to appear
        console.log('⏳ Waiting for test database file...');
        await waitForFile(dbPath, 20000);
        console.log('✅ Test database file created');
        
        // Verify the file exists and get its stats
        const fullPath = `${process.cwd()}/${dbPath}`;
        console.log('📁 Full database path:', fullPath);
        console.log('📊 File exists:', fs.existsSync(fullPath));
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            console.log('📊 File size:', stats.size, 'bytes');
        }
        
        // Small delay to ensure file is fully written
        await new Promise(res => setTimeout(res, 500));
        
        // Connect Prisma client
        console.log('🔌 Connecting Prisma client...');
        testPrisma = new PrismaClient({
            datasources: {
                db: {
                    url: absoluteDbPath
                }
            }
        });
        await testPrisma.$connect();
        console.log('✅ Test database setup complete');
    } catch (error) {
        console.error('❌ Test database setup failed:', error);
        throw error;
    }
};

// Cleanup function to run after all tests
export const teardownTestDatabase = async (): Promise<void> => {
    try {
        if (testPrisma) {
            await testPrisma.$disconnect();
            testPrisma = undefined;
        }
        await execAsync('rm -f prisma/test.db prisma/test.db-journal');
        console.log('✅ Test database cleanup complete');
    } catch (error) {
        console.error('❌ Test database cleanup failed:', error);
    }
};

// Helper function to clear all data between tests
export const clearTestData = async (): Promise<void> => {
    const prisma = getTestPrisma();
    try {
        // For SQLite, we need to disable foreign key constraints temporarily
        await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`;
        
        // Delete all data from all tables
        await prisma.storeTransaction.deleteMany();
        await prisma.storeItem.deleteMany();
        await prisma.questRequiredSkill.deleteMany();
        await prisma.userSkill.deleteMany();
        await prisma.approval.deleteMany();
        await prisma.skill.deleteMany();
        await prisma.quest.deleteMany();
        await prisma.user.deleteMany();
        
        // Re-enable foreign key constraints
        await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;
        
        // Force a brief delay to ensure transactions are committed
        await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
        console.error('❌ Failed to clear test data:', error);
        throw error;
    }
};

// Test user factory with improved uniqueness
let userCounter = 0;
export const createTestUser = async (overrides: any = {}) => {
    const prisma = getTestPrisma();
    const timestamp = Date.now();
    userCounter++; // Increment counter for each user creation
    const processId = process.pid; // Add process ID for uniqueness across test runs
    const uniqueId = `${timestamp}-${processId}-${userCounter}-${Math.floor(Math.random() * 10000)}`;
    
    const defaultUser = {
        googleId: `test-google-${uniqueId}`,
        name: 'Test User',
        email: `test-${uniqueId}@example.com`,
        role: 'PLAYER',
        bountyBalance: 0,
        ...overrides
    };
    return await prisma.user.create({ data: defaultUser });
};

// Reset user counter for test isolation
export const resetUserCounter = () => {
    userCounter = 0;
};

// Test quest factory
export const createTestQuest = async (createdBy: number, overrides: any = {}) => {
    const prisma = getTestPrisma();
    const defaultQuest = {
        title: 'Test Quest',
        description: 'A test quest for unit testing',
        bounty: 100,
        status: 'AVAILABLE',
        createdBy,
        ...overrides
    };
    return await prisma.quest.create({ data: defaultQuest });
};

// Helper to create JWT token for testing
export const createTestToken = (userId: number, email: string, role: string): string => {
    const secret = process.env['JWT_SECRET'] || 'test-secret-key';
    return jwt.sign(
        { userId, email, role },
        secret,
        { expiresIn: '1h' }
    );
};
