// Set environment before importing app
process.env['NODE_ENV'] = 'test';

import request from 'supertest';
import { Express } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from '../src/middleware/errorHandler';
import questRoutes from '../src/routes/quests';
import {
    setupTestDatabase,
    clearTestData,
    createTestUser,
    createTestQuest,
    createTestToken,
} from './setup';
import * as authMiddleware from '../src/middleware/authMiddleware';

jest.setTimeout(30000);

const createTestApp = (): Express => {
    const app = express();
    app.use(helmet());
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Use the real routes, which will use the real middleware
    app.use('/quests', questRoutes);

    app.use(errorHandler);
    return app;
};

describe('Quest Endpoints', () => {
    let app: Express;

    beforeAll(async () => {
        await setupTestDatabase();
        app = createTestApp();
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
                .query({ page: 1, limit: 10, status: 'AVAILABLE' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(2);
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
        it('should create new quest for authorized users (EDITOR)', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const questData = {
                title: 'New Epic Quest',
                description: 'A challenging quest for brave adventurers',
                bounty: 500,
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

        it('should create new quest for authorized users (ADMIN)', async () => {
            const questGiver = await createTestUser({ role: 'ADMIN' });
            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const questData = {
                title: 'New Admin Quest',
                description: 'An admin-created quest',
                bounty: 1000,
            };

            const response = await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${token}`)
                .send(questData);

            expect(response.status).toBe(201);
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
        });

        it('should return 400 for invalid quest data', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const invalidQuestData = {
                // Missing required fields
            };

            const response = await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidQuestData);

            expect(response.status).toBe(400);
        });
    });

    describe('PUT /quests/:id/claim', () => {
        it('should allow player to claim available quest', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(player.id, player.email, player.role);

            const quest = await createTestQuest(questGiver.id, {
                status: 'AVAILABLE',
                bounty: 300
            });

            const response = await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.quest.status).toBe('CLAIMED');
        });

        it('should return 400 for already claimed quest', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player1 = await createTestUser({ role: 'PLAYER', email: 'player1@test.com' });
            const player2 = await createTestUser({ role: 'PLAYER', email: 'player2@test.com' });
            const token = createTestToken(player2.id, player2.email, player2.role);

            const quest = await createTestQuest(questGiver.id, {
                status: 'CLAIMED',
                claimedBy: player1.id
            });

            const response = await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
        });

        it('should return 404 for non-existent quest', async () => {
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .put('/quests/99999/claim')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
        });
    });

    describe('PUT /quests/:id/complete', () => {
        it('should allow quest claimer to mark quest as complete', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(player.id, player.email, player.role);

            const quest = await createTestQuest(questGiver.id, {
                status: 'CLAIMED',
                claimedBy: player.id,
                bounty: 400
            });

            const response = await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.quest.status).toBe('PENDING_APPROVAL');
        });

        it('should return 403 for user who did not claim the quest', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const player1 = await createTestUser({ role: 'PLAYER', email: 'player1@test.com' });
            const player2 = await createTestUser({ role: 'PLAYER', email: 'player2@test.com' });
            const token = createTestToken(player2.id, player2.email, player2.role);

            const quest = await createTestQuest(questGiver.id, {
                status: 'CLAIMED',
                claimedBy: player1.id
            });

            const response = await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /quests/my-created', () => {
        it('should return quests created by the authenticated user', async () => {
            const questGiver = await createTestUser({ role: 'EDITOR' });
            const otherQuestGiver = await createTestUser({
                role: 'EDITOR',
                email: 'other@test.com'
            });
            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            await createTestQuest(questGiver.id, { title: 'My Quest 1' });
            await createTestQuest(questGiver.id, { title: 'My Quest 2' });
            await createTestQuest(otherQuestGiver.id, { title: 'Other Quest' });

            const response = await request(app)
                .get('/quests/my-created')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.quests).toHaveLength(2);
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
            const token = createTestToken(player.id, player.email, player.role);

            await createTestQuest(questGiver.id, { status: 'CLAIMED', claimedBy: player.id });
            await createTestQuest(questGiver.id, { status: 'COMPLETED', claimedBy: player.id });
            await createTestQuest(questGiver.id, { status: 'CLAIMED', claimedBy: otherPlayer.id });

            const response = await request(app)
                .get('/quests/my-claimed')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.data.quests).toHaveLength(2);
        });
    });

    describe('Personalized Quests', () => {
        it('should allow creation of a quest for a specific user', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(admin.id, admin.email, admin.role);

            const questData = {
                title: 'Personal Quest',
                description: 'A quest just for one user',
                bounty: 150,
                userId: player.id
            };

            const response = await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${token}`)
                .send(questData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.userId).toBe(player.id);
        });

        it('should show personalized quests only to the specified user', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const player1 = await createTestUser({ role: 'PLAYER' });
            const player2 = await createTestUser({ role: 'PLAYER' });
            const adminToken = createTestToken(admin.id, admin.email, admin.role);
            const player1Token = createTestToken(player1.id, player1.email, player1.role);
            const player2Token = createTestToken(player2.id, player2.email, player2.role);

            // Create a personalized quest for player1
            await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Personal Quest',
                    description: 'For player1 only',
                    bounty: 200,
                    userId: player1.id
                });
            // Create a global quest
            await request(app)
                .post('/quests')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Global Quest',
                    description: 'For everyone',
                    bounty: 100
                });

            // Player1 should see both quests
            const res1 = await request(app)
                .get('/quests')
                .set('Authorization', `Bearer ${player1Token}`);
            expect(res1.status).toBe(200);
            const titles1 = res1.body.data.quests.map((q: any) => q.title);
            expect(titles1).toContain('Personal Quest');
            expect(titles1).toContain('Global Quest');

            // Player2 should only see the global quest
            const res2 = await request(app)
                .get('/quests')
                .set('Authorization', `Bearer ${player2Token}`);
            expect(res2.status).toBe(200);
            const titles2 = res2.body.data.quests.map((q: any) => q.title);
            expect(titles2).not.toContain('Personal Quest');
            expect(titles2).toContain('Global Quest');
        });

        it('should only allow the specified user to claim a personalized quest', async () => {
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

            // Player1 can claim
            const claimRes1 = await request(app)
                .put(`/quests/${questId}/claim`)
                .set('Authorization', `Bearer ${player1Token}`);
            expect(claimRes1.status).toBe(200);
            expect(claimRes1.body.data.quest.status).toBe('CLAIMED');

            // Player2 cannot claim
            const claimRes2 = await request(app)
                .put(`/quests/${questId}/claim`)
                .set('Authorization', `Bearer ${player2Token}`);
            expect(claimRes2.status).toBe(403);
        });
    });
});
