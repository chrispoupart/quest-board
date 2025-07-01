// Set environment before importing app
process.env['NODE_ENV'] = 'test';

import request from 'supertest';
import { app } from '../src/index';
import {
    ensureTestDatabase,
    clearTestData,
    createTestUser,
    createTestQuest,
    createTestToken,
    getTestPrisma
} from './setup';

jest.setTimeout(30000);

describe('Quest Endpoints', () => {
    beforeAll(async () => {
        await ensureTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
    });

    describe('GET /quests', () => {
        it('should return paginated list of available quests', async () => {
            // Create test users
            const questGiver = await createTestUser({
                role: 'EDITOR',
                name: 'Quest Giver',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                name: 'Player',
                email: 'player@test.com'
            });

            // Create some test quests
            await createTestQuest(questGiver.id, {
                title: 'Quest 1',
                status: 'AVAILABLE',
                bounty: 100
            });
            await createTestQuest(questGiver.id, {
                title: 'Quest 2',
                status: 'AVAILABLE',
                bounty: 200
            });
            await createTestQuest(questGiver.id, {
                title: 'Quest 3',
                status: 'CLAIMED',
                claimedBy: player.id
            });

            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .get('/quests')
                .set('Authorization', `Bearer ${token}`)
                .query({ page: 1, limit: 10 });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(3);
            expect(response.body.data.pagination).toBeDefined();
            expect(response.body.data.pagination.currentPage).toBe(1);
            expect(response.body.data.pagination.totalPages).toBe(1);
        });

        it('should filter quests by status', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player = await createTestUser({ role: 'PLAYER' });

            await createTestQuest(questGiver.id, { status: 'AVAILABLE' });
            await createTestQuest(questGiver.id, { status: 'CLAIMED', claimedBy: player.id });

            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .get('/quests')
                .set('Authorization', `Bearer ${token}`)
                .query({ status: 'AVAILABLE' });

            expect(response.status).toBe(200);
            expect(response.body.data.quests).toHaveLength(1);
            expect(response.body.data.quests[0].status).toBe('AVAILABLE');
        });

        it('should return 401 for unauthenticated requests', async () => {
            const response = await request(app).get('/quests');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /quests', () => {
        it('should create new quest for authorized users', async () => {
            const questGiver = await createTestUser({
                role: 'EDITOR',
                name: 'Quest Giver',
                email: 'questgiver@test.com'
            });
            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const questData = {
                title: 'New Epic Quest',
                description: 'A challenging quest for brave adventurers',
                bounty: 500,
                category: 'EPIC',
                priority: 'HIGH'
            };

            const response = await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${token}`)
                .send(questData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.title).toBe(questData.title);
            expect(response.body.data.quest.bounty).toBe(questData.bounty);
            expect(response.body.data.quest.status).toBe('AVAILABLE');
            expect(response.body.data.quest.createdBy).toBe(questGiver.id);
        });

        it('should return 403 for players trying to create quests', async () => {
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(player.id, player.email, player.role);

            const questData = {
                title: 'Unauthorized Quest',
                description: 'Should not be created',
                bounty: 100
            };

            const response = await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${token}`)
                .send(questData);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for invalid quest data', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const invalidQuestData = {
                // Missing required fields
                bounty: -100 // Invalid bounty
            };

            const response = await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidQuestData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /quests/:id/claim', () => {
        it('should allow player to claim available quest', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player = await createTestUser({ role: 'PLAYER' });

            const quest = await createTestQuest(questGiver.id, {
                status: 'AVAILABLE',
                bounty: 300
            });

            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('CLAIMED');
            expect(response.body.data.quest.claimedBy).toBe(player.id);
        });

        it('should return 400 for already claimed quest', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player1 = await createTestUser({ role: 'PLAYER', email: 'player1@test.com' });
            const player2 = await createTestUser({ role: 'PLAYER', email: 'player2@test.com' });

            const quest = await createTestQuest(questGiver.id, {
                status: 'CLAIMED',
                claimedBy: player1.id
            });

            const token = createTestToken(player2.id, player2.email, player2.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('already claimed');
        });

        it('should return 404 for non-existent quest', async () => {
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .put('/quests/99999/claim')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });

    describe('PUT /quests/:id/complete', () => {
        it('should allow quest claimer to mark quest as complete', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player = await createTestUser({ role: 'PLAYER' });

            const quest = await createTestQuest(questGiver.id, {
                status: 'CLAIMED',
                claimedBy: player.id,
                bounty: 400
            });

            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('COMPLETED');
        });

        it('should return 403 for user who did not claim the quest', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player1 = await createTestUser({ role: 'PLAYER', email: 'player1@test.com' });
            const player2 = await createTestUser({ role: 'PLAYER', email: 'player2@test.com' });

            const quest = await createTestQuest(questGiver.id, {
                status: 'CLAIMED',
                claimedBy: player1.id
            });

            const token = createTestToken(player2.id, player2.email, player2.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /quests/my-created', () => {
        it('should return quests created by the authenticated user', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const otherQuestGiver = await createTestUser({
                role: 'EDITOR',
                email: 'other@test.com'
            });

            await createTestQuest(questGiver.id, { title: 'My Quest 1' });
            await createTestQuest(questGiver.id, { title: 'My Quest 2' });
            await createTestQuest(otherQuestGiver.id, { title: 'Other Quest' });

            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const response = await request(app)
                .get('/quests/my-created')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(2);
            expect(response.body.data.quests[0].createdBy).toBe(questGiver.id);
            expect(response.body.data.quests[1].createdBy).toBe(questGiver.id);
        });
    });

    describe('GET /quests/my-claimed', () => {
        it('should return quests claimed by the authenticated user', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player = await createTestUser({ role: 'PLAYER' });
            const otherPlayer = await createTestUser({
                role: 'PLAYER',
                email: 'other@test.com'
            });

            await createTestQuest(questGiver.id, {
                title: 'My Claimed Quest 1',
                status: 'CLAIMED',
                claimedBy: player.id
            });
            await createTestQuest(questGiver.id, {
                title: 'My Claimed Quest 2',
                status: 'COMPLETED',
                claimedBy: player.id
            });
            await createTestQuest(questGiver.id, {
                title: 'Other Player Quest',
                status: 'CLAIMED',
                claimedBy: otherPlayer.id
            });

            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .get('/quests/my-claimed')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(2);
            expect(response.body.data.quests[0].claimedBy).toBe(player.id);
            expect(response.body.data.quests[1].claimedBy).toBe(player.id);
        });
    });
});
