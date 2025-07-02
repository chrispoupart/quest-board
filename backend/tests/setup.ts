// Set DATABASE_URL for test environment BEFORE any imports
process.env['DATABASE_URL'] = `file:${process.cwd()}/prisma/test.db`;
process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret-key';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-that-is-long-enough-for-security';

import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import path from 'path';
import { exec } from 'child_process';



const execAsync = promisify(exec);

// Internal variable for the Prisma client
let testPrisma: PrismaClient | undefined = undefined;

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

// Helper for conditional debug logging
function debugLog(...args: any[]) {
    if (process.env['DEBUG'] === 'true') {
        // eslint-disable-next-line no-console
        console.log(...args);
    }
}

// Setup function to run before all tests
export const setupTestDatabase = async (): Promise<void> => {
    try {
        const dbPath = 'prisma/test.db';

        debugLog('🗃️  Using DATABASE_URL:', process.env['DATABASE_URL']);
        debugLog('🗃️  Current working directory:', process.cwd());

        // Remove any old test DB files
        await execAsync('rm -f prisma/test.db prisma/test.db-journal');
        debugLog('🧹 Cleaned up old test database files');

        // Run migrations from the prisma directory, using a relative path
        debugLog('🔄 Running database migrations...');
        await execAsync(`npx prisma migrate deploy`);

        // Wait for the test DB file to appear
        debugLog('⏳ Waiting for test database file...');
        await waitForFile(dbPath, 20000);
        debugLog('✅ Test database file created');

        // Verify the file exists and get its stats
        const fullPath = `${process.cwd()}/${dbPath}`;
        debugLog('📁 Full database path:', fullPath);
        debugLog('📊 File exists:', fs.existsSync(fullPath));
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            debugLog('📊 File size:', stats.size, 'bytes');
        }

        // Small delay to ensure file is fully written
        await new Promise(res => setTimeout(res, 500));

        // Connect Prisma client
        debugLog('🔌 Connecting Prisma client...');
        testPrisma = new PrismaClient({ log: [] });
        await testPrisma.$connect();
        debugLog('✅ Test database setup complete');
    } catch (error) {
        debugLog('❌ Test database setup failed:', error);
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
        debugLog('✅ Test database cleanup complete');
    } catch (error) {
        debugLog('❌ Test database cleanup failed:', error);
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
        await prisma.questCompletion.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.approval.deleteMany();
        await prisma.skill.deleteMany();
        await prisma.quest.deleteMany();
        await prisma.user.deleteMany();

        // Re-enable foreign key constraints
        await prisma.$executeRaw`PRAGMA foreign_keys = ON;`;

        // Force a brief delay to ensure transactions are committed
        await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
        debugLog('❌ Failed to clear test data:', error);
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
