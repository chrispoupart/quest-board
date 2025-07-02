// Set environment before importing app
process.env['NODE_ENV'] = 'test';

import {
    setupTestDatabase,
    clearTestData,
    createTestUser,
    createTestQuest,
    createTestToken,
    getTestPrisma,
    teardownTestDatabase,
    resetUserCounter
} from './setup';

// Mock the db module BEFORE importing the app.
// This ensures the app uses the same Prisma client instance as the tests.
jest.mock('../src/db', () => ({
  __esModule: true,
  get prisma() {
    return getTestPrisma();
  },
}));

import request from 'supertest';
import { app } from '../src/index';

jest.setTimeout(30000);

describe('Dashboard Endpoints', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
    });

    describe('GET /dashboard/stats', () => {
        it('should return user dashboard statistics', async () => {
            const user = await createTestUser({
                role: 'PLAYER',
                bountyBalance: 300
            });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });

            // Create test quests with different statuses
            await createTestQuest(questGiver.id, {
                status: 'APPROVED',
                claimedBy: user.id,
                bounty: 100
            });
            await createTestQuest(questGiver.id, {
                status: 'CLAIMED',
                claimedBy: user.id,
                bounty: 200
            });
            await createTestQuest(user.id, {
                status: 'AVAILABLE',
                bounty: 150
            });

            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get('/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const stats = response.body.data.stats;
            expect(stats.completedQuests).toBe(1);
            expect(stats.totalBounty).toBe(100);
            expect(stats.activeQuests).toBe(1);
            expect(stats.questsCreated).toBe(1);
        });

        it('should return empty stats for new user', async () => {
            const user = await createTestUser({
                role: 'PLAYER',
                bountyBalance: 0
            });

            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get('/dashboard/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            const stats = response.body.data.stats;
            expect(stats.completedQuests).toBe(0);
            expect(stats.totalBounty).toBe(0);
            expect(stats.activeQuests).toBe(0);
            expect(stats.questsCreated).toBe(0);
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app).get('/dashboard/stats');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /dashboard/active-quests', () => {
        it('should return user active claimed quests', async () => {
            const user = await createTestUser({ role: 'PLAYER' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });

            const activeQuest1 = await createTestQuest(questGiver.id, {
                title: 'Active Quest 1',
                status: 'CLAIMED',
                claimedBy: user.id,
                bounty: 100
            });
            const activeQuest2 = await createTestQuest(questGiver.id, {
                title: 'Active Quest 2',
                status: 'COMPLETED',
                claimedBy: user.id,
                bounty: 200
            });
            // Quest claimed by another user - should not appear
            await createTestQuest(questGiver.id, {
                title: 'Other User Quest',
                status: 'CLAIMED',
                claimedBy: questGiver.id
            });

            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get('/dashboard/active-quests')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(2);

            const questTitles = response.body.data.quests.map((q: any) => q.title);
            expect(questTitles).toContain('Active Quest 1');
            expect(questTitles).toContain('Active Quest 2');
        });

        it('should return empty array for user with no active quests', async () => {
            const user = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get('/dashboard/active-quests')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(0);
        });
    });

    describe('GET /dashboard/recent-activity', () => {
        it('should return recent quest activity for quest creators', async () => {
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com'
            });

            // Create quests with different statuses
            await createTestQuest(questGiver.id, {
                title: 'Recent Quest 1',
                status: 'AVAILABLE',
                bounty: 100
            });
            await createTestQuest(questGiver.id, {
                title: 'Recent Quest 2',
                status: 'CLAIMED',
                claimedBy: player.id,
                bounty: 200
            });

            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const response = await request(app)
                .get('/dashboard/recent-activity')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(2);
        });

        it('should return recent quest activity for players', async () => {
            const player = await createTestUser({ role: 'PLAYER' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });

            await createTestQuest(questGiver.id, {
                title: 'Player Completed Quest',
                status: 'APPROVED',
                claimedBy: player.id,
                bounty: 300
            });

            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .get('/dashboard/recent-activity')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(1);
            expect(response.body.data.quests[0].title).toBe('Player Completed Quest');
        });

        it('should limit results to recent activity', async () => {
            const user = await createTestUser({ role: 'EDITOR' });

            // Create more than the default limit of quests
            for (let i = 1; i <= 15; i++) {
                await createTestQuest(user.id, {
                    title: `Quest ${i}`,
                    status: 'AVAILABLE',
                    bounty: 100
                });
            }

            const token = createTestToken(user.id, user.email, user.role);

            const response = await request(app)
                .get('/dashboard/recent-activity')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            // Should limit to 10 most recent
            expect(response.body.data.quests.length).toBeLessThanOrEqual(10);
        });
    });
});

describe('Leaderboard API', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
        resetUserCounter();
    });

    it('should return the top 5 users by bounty earned for the current month', async () => {
        const now = new Date();
        const users = [];
        // Create 6 users
        for (let i = 0; i < 6; i++) {
            users.push(await createTestUser({ name: `User${i + 1}` }));
        }
        // Give each user a different bounty total for the current month
        const prisma = getTestPrisma();
        for (let i = 0; i < 6; i++) {
            // Each user completes i+1 quests, each worth 10 bounty
            for (let j = 0; j < i + 1; j++) {
                const quest = await prisma.quest.create({
                    data: {
                        title: `Quest for User${i + 1}`,
                        bounty: 10,
                        status: 'COMPLETED',
                        createdBy: users[i].id,
                        claimedBy: users[i].id,
                        claimedAt: now,
                        completedAt: now,
                    },
                });
                await prisma.questCompletion.create({
                    data: {
                        questId: quest.id,
                        userId: users[i].id,
                        completedAt: now,
                        status: 'APPROVED',
                    },
                });
            }
        }

        // Diagnostic query
        const diagnosticPrisma = getTestPrisma();
        const monthForDiag = now.toISOString().slice(0, 7);
        const [year, mon] = monthForDiag.split('-').map(Number);
        const start = new Date(year, mon - 1, 1);
        const end = new Date(year, mon, 1);
        const completionsInTest = await diagnosticPrisma.questCompletion.findMany({
            where: {
                completedAt: { gte: start, lt: end },
                status: 'APPROVED'
            }
        });
        console.log('DIAGNOSTIC: Completions found in test right before API call:', completionsInTest.length);

        // Authenticate as the first user
        const authUser = users[0];
        const token = createTestToken(authUser.id, authUser.email, authUser.role);
        // Call the leaderboard endpoint
        const month = now.toISOString().slice(0, 7); // YYYY-MM
        const res = await request(app)
            .get(`/dashboard/leaderboard/bounty?month=${month}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(5);
        // The user with the most completions should be first
        expect(res.body[0].name).toBe('User6');
        expect(res.body[0].bounty).toBe(60);
        expect(res.body[4].name).toBe('User2');
        expect(res.body[4].bounty).toBe(20);
        // User1 should not be in the top 5
        expect(res.body.find((u: { name: string }) => u.name === 'User1')).toBeUndefined();
    });
});
