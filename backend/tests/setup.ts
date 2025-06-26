import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(childProcess.exec);

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

// Setup function to run before all tests
export const setupTestDatabase = async (): Promise<void> => {
    try {
        process.env['DATABASE_URL'] = 'file:./prisma/test.db';
        await execAsync('rm -f prisma/test.db');
        await execAsync('DATABASE_URL="file:./prisma/test.db" npx prisma migrate deploy');
        await waitForFile('prisma/test.db', 5000);
        testPrisma = new PrismaClient();
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
        await execAsync('rm -f prisma/test.db');
        console.log('✅ Test database cleanup complete');
    } catch (error) {
        console.error('❌ Test database cleanup failed:', error);
    }
};

// Helper function to clear all data between tests
export const clearTestData = async (): Promise<void> => {
    const prisma = getTestPrisma();
    try {
        // Delete in reverse order of dependencies, with error handling for each
        try {
            await prisma.approval.deleteMany();
        } catch (error) { }
        try {
            await prisma.quest.deleteMany();
        } catch (error) { }
        try {
            await prisma.user.deleteMany();
        } catch (error) { }
    } catch (error) {
        console.error('❌ Failed to clear test data:', error);
        throw error;
    }
};

// Test user factory
export const createTestUser = async (overrides: any = {}) => {
    const prisma = getTestPrisma();
    const defaultUser = {
        googleId: `test-google-${Date.now()}`,
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        role: 'PLAYER',
        bountyBalance: 0,
        ...overrides
    };
    return await prisma.user.create({ data: defaultUser });
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
    return jwt.sign(
        { userId, email, role },
        process.env['JWT_SECRET'] || 'test-secret',
        { expiresIn: '1h' }
    );
};
