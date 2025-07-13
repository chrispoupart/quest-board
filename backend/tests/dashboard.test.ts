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
            const approvedQuest = await createTestQuest(questGiver.id, {
                status: 'APPROVED',
                claimedBy: user.id,
                bounty: 100
            });
            // Add questCompletion for the approved quest
            const prisma = getTestPrisma();
            await prisma.questCompletion.create({
                data: {
                    questId: approvedQuest.id,
                    userId: user.id,
                    completedAt: new Date(),
                    status: 'APPROVED'
                }
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

    describe('Personalized Quests in Dashboard', () => {
        it('should count personalized quests only for the specified user', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const player1 = await createTestUser({ role: 'PLAYER' });
            const player2 = await createTestUser({ role: 'PLAYER' });
            const adminToken = createTestToken(admin.id, admin.email, admin.role);
            const player1Token = createTestToken(player1.id, player1.email, player1.role);
            const player2Token = createTestToken(player2.id, player2.email, player2.role);

            // Create a personalized quest for player1 and a global quest
            await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Personal Quest',
                    description: 'For player1 only',
                    bounty: 200,
                    userId: player1.id
                });
            await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Global Quest',
                    description: 'For everyone',
                    bounty: 100
                });

            // Player1 stats should include both quests
            const statsRes1 = await request(app)
                .get('/dashboard/stats')
                .set('Authorization', `Bearer ${player1Token}`);
            expect(statsRes1.status).toBe(200);
            expect(statsRes1.body.success).toBe(true);
            expect(statsRes1.body.data.stats.questsCreated).toBe(0); // Not creator
            // Should see both quests as available
            const questsRes1 = await request(app)
                .get('/quests')
                .set('Authorization', `Bearer ${player1Token}`);
            const titles1 = questsRes1.body.data.quests.map((q: any) => q.title);
            expect(titles1).toContain('Personal Quest');
            expect(titles1).toContain('Global Quest');

            // Player2 stats should not include the personalized quest
            const statsRes2 = await request(app)
                .get('/dashboard/stats')
                .set('Authorization', `Bearer ${player2Token}`);
            expect(statsRes2.status).toBe(200);
            expect(statsRes2.body.success).toBe(true);
            // Should only see the global quest
            const questsRes2 = await request(app)
                .get('/quests')
                .set('Authorization', `Bearer ${player2Token}`);
            const titles2 = questsRes2.body.data.quests.map((q: any) => q.title);
            expect(titles2).not.toContain('Personal Quest');
            expect(titles2).toContain('Global Quest');
        });

        it('should show personalized quests as active only for the specified user', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const player1 = await createTestUser({ role: 'PLAYER' });
            const player2 = await createTestUser({ role: 'PLAYER' });
            const adminToken = createTestToken(admin.id, admin.email, admin.role);
            const player1Token = createTestToken(player1.id, player1.email, player1.role);
            const player2Token = createTestToken(player2.id, player2.email, player2.role);

            // Create a personalized quest for player1
            const questRes = await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Personal Quest',
                    description: 'For player1 only',
                    bounty: 200,
                    userId: player1.id
                });
            const questId = questRes.body.data.quest.id;

            // Player1 claims the quest
            await request(app)
                .put(`/quests/${questId}/claim`)
                .set('Authorization', `Bearer ${player1Token}`);

            // Player1 should see it as active
            const activeRes1 = await request(app)
                .get('/dashboard/active-quests')
                .set('Authorization', `Bearer ${player1Token}`);
            const titles1 = activeRes1.body.data.quests.map((q: any) => q.title);
            expect(titles1).toContain('Personal Quest');

            // Player2 should not see it as active
            const activeRes2 = await request(app)
                .get('/dashboard/active-quests')
                .set('Authorization', `Bearer ${player2Token}`);
            const titles2 = activeRes2.body.data.quests.map((q: any) => q.title);
            expect(titles2).not.toContain('Personal Quest');
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

    it('should return the top 5 users by quests completed for the current month', async () => {
        const now = new Date();
        const users = [];
        // Create 6 users
        for (let i = 0; i < 6; i++) {
            users.push(await createTestUser({ name: `User${i + 1}` }));
        }

        const prisma = getTestPrisma();
        // Give each user a different number of completed quests
        for (let i = 0; i < 6; i++) {
            // User i+1 completes i+1 quests
            for (let j = 0; j < i + 1; j++) {
                const quest = await prisma.quest.create({
                    data: {
                        title: `Quest ${j} for User${i + 1}`,
                        bounty: 10,
                        status: 'COMPLETED',
                        createdBy: users[i].id,
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

        // Authenticate as any user
        const authUser = users[0];
        const token = createTestToken(authUser.id, authUser.email, authUser.role);

        // Call the leaderboard endpoint
        const month = now.toISOString().slice(0, 7); // YYYY-MM
        const res = await request(app)
            .get(`/dashboard/leaderboard/quests?month=${month}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(5);

        // User6 should be first with 6 quests
        expect(res.body[0].name).toBe('User6');
        expect(res.body[0].questsCompleted).toBe(6);

        // User2 should be last in the top 5 with 2 quests
        expect(res.body[4].name).toBe('User2');
        expect(res.body[4].questsCompleted).toBe(2);

        // User1 (with 1 quest) should not be in the top 5
        expect(res.body.find((u: { name: string }) => u.name === 'User1')).toBeUndefined();
    });
});

describe('GET /dashboard/quests', () => {
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

    it('should only show personalized quests to the assigned user', async () => {
        const questGiver = await createTestUser({ role: 'EDITOR' });
        const assignedPlayer = await createTestUser({ role: 'PLAYER', email: 'assigned@test.com' });
        const otherPlayer = await createTestUser({ role: 'PLAYER', email: 'other@test.com' });

        // Create a global quest
        await createTestQuest(questGiver.id, {
            title: 'Global Quest',
            status: 'AVAILABLE',
            bounty: 100
        });

        // Create a personalized quest for assignedPlayer
        await createTestQuest(questGiver.id, {
            title: 'Personalized Quest',
            status: 'AVAILABLE',
            bounty: 150,
            userId: assignedPlayer.id
        });

        // Create a personalized quest for otherPlayer
        await createTestQuest(questGiver.id, {
            title: 'Other Player Quest',
            status: 'AVAILABLE',
            bounty: 200,
            userId: otherPlayer.id
        });

        // Assigned player should see global quest and their personalized quest
        const assignedPlayerToken = createTestToken(assignedPlayer.id, assignedPlayer.email, assignedPlayer.role);
        let response = await request(app)
            .get('/dashboard/quests')
            .set('Authorization', `Bearer ${assignedPlayerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quests).toHaveLength(2);
        const assignedPlayerTitles = response.body.data.quests.map((q: any) => q.title);
        expect(assignedPlayerTitles).toContain('Global Quest');
        expect(assignedPlayerTitles).toContain('Personalized Quest');
        expect(assignedPlayerTitles).not.toContain('Other Player Quest');

        // Other player should only see global quest and their own personalized quest
        const otherPlayerToken = createTestToken(otherPlayer.id, otherPlayer.email, otherPlayer.role);
        response = await request(app)
            .get('/dashboard/quests')
            .set('Authorization', `Bearer ${otherPlayerToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quests).toHaveLength(2);
        const otherPlayerTitles = response.body.data.quests.map((q: any) => q.title);
        expect(otherPlayerTitles).toContain('Global Quest');
        expect(otherPlayerTitles).toContain('Other Player Quest');
        expect(otherPlayerTitles).not.toContain('Personalized Quest');
    });

    it('admin should see all quests including personalized ones', async () => {
        const questGiver = await createTestUser({ role: 'EDITOR' });
        const assignedPlayer = await createTestUser({ role: 'PLAYER', email: 'assigned@test.com' });
        const admin = await createTestUser({ role: 'ADMIN', email: 'admin@test.com' });

        // Create a global quest
        await createTestQuest(questGiver.id, {
            title: 'Global Quest',
            status: 'AVAILABLE',
            bounty: 100
        });

        // Create a personalized quest
        await createTestQuest(questGiver.id, {
            title: 'Personalized Quest',
            status: 'AVAILABLE',
            bounty: 150,
            userId: assignedPlayer.id
        });

        const adminToken = createTestToken(admin.id, admin.email, admin.role);
        const response = await request(app)
            .get('/dashboard/quests')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quests).toHaveLength(2);
        const titles = response.body.data.quests.map((q: any) => q.title);
        expect(titles).toContain('Global Quest');
        expect(titles).toContain('Personalized Quest');
    });

    it('should exclude expired quests', async () => {
        const questGiver = await createTestUser({ role: 'EDITOR' });
        const player = await createTestUser({ role: 'PLAYER' });
        const token = createTestToken(player.id, player.email, player.role);

        // Create a quest with past due date
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Yesterday

        await createTestQuest(questGiver.id, {
            title: 'Expired Quest',
            status: 'AVAILABLE',
            bounty: 100,
            dueDate: pastDate
        });

        // Create a valid quest
        await createTestQuest(questGiver.id, {
            title: 'Valid Quest',
            status: 'AVAILABLE',
            bounty: 100
        });

        const response = await request(app)
            .get('/dashboard/quests')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quests).toHaveLength(1);
        expect(response.body.data.quests[0].title).toBe('Valid Quest');
    });

    it('should support status filtering', async () => {
        const questGiver = await createTestUser({ role: 'EDITOR' });
        const player = await createTestUser({ role: 'PLAYER' });
        const token = createTestToken(player.id, player.email, player.role);

        // Create quests with different statuses
        await createTestQuest(questGiver.id, {
            title: 'Available Quest',
            status: 'AVAILABLE',
            bounty: 100
        });

        await createTestQuest(questGiver.id, {
            title: 'Claimed Quest',
            status: 'CLAIMED',
            claimedBy: player.id,
            bounty: 200
        });

        // Test filtering by AVAILABLE status
        let response = await request(app)
            .get('/dashboard/quests?status=AVAILABLE')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quests).toHaveLength(1);
        expect(response.body.data.quests[0].title).toBe('Available Quest');

        // Test filtering by CLAIMED status
        response = await request(app)
            .get('/dashboard/quests?status=CLAIMED')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quests).toHaveLength(1);
        expect(response.body.data.quests[0].title).toBe('Claimed Quest');
    });

    it('should support search functionality', async () => {
        const questGiver = await createTestUser({ role: 'EDITOR' });
        const player = await createTestUser({ role: 'PLAYER' });
        const token = createTestToken(player.id, player.email, player.role);

        // Create quests with different titles
        await createTestQuest(questGiver.id, {
            title: 'Dragon Slayer Quest',
            status: 'AVAILABLE',
            bounty: 100
        });

        await createTestQuest(questGiver.id, {
            title: 'Treasure Hunt Quest',
            status: 'AVAILABLE',
            bounty: 200
        });

        // Test search by title
        const response = await request(app)
            .get('/dashboard/quests?search=Dragon') // Using uppercase 'D' to test case-sensitivity
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.data.quests).toHaveLength(1);
        expect(response.body.data.quests[0].title).toBe('Dragon Slayer Quest');
    });

    it('should require authentication', async () => {
        const response = await request(app).get('/dashboard/quests');
        expect(response.status).toBe(401);
    });
});

describe('Reward Config API', () => {
    let adminUser: any;
    let regularUser: any;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        await setupTestDatabase();
        adminUser = await createTestUser({ role: 'ADMIN', email: 'admin@example.com' });
        regularUser = await createTestUser({ role: 'PLAYER', email: 'user@example.com' });
        adminToken = createTestToken(adminUser.id, adminUser.email, adminUser.role);
        userToken = createTestToken(regularUser.id, regularUser.email, regularUser.role);
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
        resetUserCounter();
    });

    it('should allow admin to get and update reward config', async () => {
        // Admin can get config (should be default or empty)
        let res = await request(app)
            .get('/rewards/config')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        expect(res.body).toHaveProperty('monthlyBountyReward');
        expect(res.body).toHaveProperty('monthlyQuestReward');
        expect(res.body).toHaveProperty('quarterlyCollectiveGoal');
        expect(res.body).toHaveProperty('quarterlyCollectiveReward');

        // Admin can update config
        const newConfig = {
            monthlyBountyReward: 100,
            monthlyQuestReward: 50,
            quarterlyCollectiveGoal: 1000,
            quarterlyCollectiveReward: 'Pizza Party!'
        };
        res = await request(app)
            .post('/rewards/config')
            .set('Authorization', `Bearer ${adminToken}`)
            .send(newConfig)
            .expect(200);
        expect(res.body.success).toBe(true);

        // Admin can get updated config
        res = await request(app)
            .get('/rewards/config')
            .set('Authorization', `Bearer ${adminToken}`)
            .expect(200);
        expect(res.body.monthlyBountyReward).toBe(100);
        expect(res.body.monthlyQuestReward).toBe(50);
        expect(res.body.quarterlyCollectiveGoal).toBe(1000);
        expect(res.body.quarterlyCollectiveReward).toBe('Pizza Party!');
    });

    it('should not allow non-admins to update reward config', async () => {
        const newConfig = {
            monthlyBountyReward: 200,
            monthlyQuestReward: 100,
            quarterlyCollectiveGoal: 2000,
            quarterlyCollectiveReward: 'Ice Cream Social!'
        };
        // Non-admin cannot update
        const res = await request(app)
            .post('/rewards/config')
            .set('Authorization', `Bearer ${userToken}`)
            .send(newConfig)
            .expect(403);
        expect(res.body.success).toBe(false);
    });

    it('should not allow unauthenticated users to get or update config', async () => {
        await request(app)
            .get('/rewards/config')
            .expect(401);
        await request(app)
            .post('/rewards/config')
            .send({})
            .expect(401);
    });
});

describe('Collective Reward Progress API', () => {
    let user: any;
    let token: string;

    beforeAll(async () => {
        await setupTestDatabase();
        user = await createTestUser({ role: 'PLAYER', email: 'user@example.com' });
        token = createTestToken(user.id, user.email, user.role);
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
        resetUserCounter();
    });

    it('should return the collective reward progress for the quarter', async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        const quarterParam = `${year}-Q${quarter}`;

        // Set a collective goal in the reward config
        const prisma = getTestPrisma();
        await prisma.rewardConfig.create({
            data: {
                monthlyBountyReward: 0,
                monthlyQuestReward: 0,
                quarterlyCollectiveGoal: 1000,
                quarterlyCollectiveReward: 'Team Pizza Party!'
            }
        });

        // Seed users and completions in the current quarter
        let totalBounty = 0;
        for (let i = 0; i < 3; i++) {
            const u = await createTestUser({ name: `User${i + 1}` });
            for (let j = 0; j < i + 1; j++) {
                const quest = await prisma.quest.create({
                    data: {
                        title: `Quest ${j} for User${i + 1}`,
                        bounty: 100,
                        status: 'COMPLETED',
                        createdBy: u.id,
                    },
                });
                await prisma.questCompletion.create({
                    data: {
                        questId: quest.id,
                        userId: u.id,
                        completedAt: now,
                        status: 'APPROVED',
                    },
                });
                totalBounty += 100;
            }
        }

        // Call the endpoint
        const res = await request(app)
            .get(`/rewards/collective-progress?quarter=${quarterParam}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty('goal', 1000);
        expect(res.body).toHaveProperty('reward', 'Team Pizza Party!');
        expect(res.body).toHaveProperty('progress', totalBounty);
        expect(res.body).toHaveProperty('percent');
        expect(typeof res.body.percent).toBe('number');
        expect(res.body.percent).toBeCloseTo((totalBounty / 1000) * 100, 1);
    });

    it('should require authentication', async () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        const quarterParam = `${year}-Q${quarter}`;
        await request(app)
            .get(`/rewards/collective-progress?quarter=${quarterParam}`)
            .expect(401);
    });
});
