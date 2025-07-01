// Set environment before importing anything
process.env['NODE_ENV'] = 'test';

import {
    setupTestDatabase,
    teardownTestDatabase,
    clearTestData,
    createTestUser,
    createTestQuest,
    createTestToken,
    getTestPrisma
} from './setup';

jest.setTimeout(30000);

describe('Test Setup', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        // Only clean up in the last test file
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
    });

    it('should create test users', async () => {
        const user = await createTestUser({
            name: 'Test User',
            email: 'test@example.com',
            role: 'PLAYER'
        });

        expect(user.id).toBeDefined();
        expect(user.name).toBe('Test User');
        expect(user.email).toBe('test@example.com');
        expect(user.role).toBe('PLAYER');
    });

    it('should create test quests', async () => {
        const user = await createTestUser({ role: 'EDITOR' });
        const quest = await createTestQuest(user.id, {
            title: 'Test Quest',
            description: 'A test quest',
            bounty: 100
        });

        expect(quest.id).toBeDefined();
        expect(quest.title).toBe('Test Quest');
        expect(quest.bounty).toBe(100);
        expect(quest.createdBy).toBe(user.id);
    });

    it('should create valid JWT tokens', async () => {
        const user = await createTestUser();
        const token = createTestToken(user.id, user.email, user.role);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
    });
});
