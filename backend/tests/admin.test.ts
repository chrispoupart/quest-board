import request from 'supertest';
import app from '../src/index';
import {
    setupTestDatabase,
    teardownTestDatabase,
    clearTestData,
    createTestUser,
    createTestQuest,
    createTestToken,
    getTestPrisma
} from './setup';

describe('Admin Quest Approval Endpoints', () => {
    beforeAll(async () => {
        process.env['NODE_ENV'] = 'test';
        await setupTestDatabase();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
    });

    describe('PUT /quests/:id/approve', () => {
        it('should allow admin to approve completed quest', async () => {
            const admin = await createTestUser({
                role: 'ADMIN',
                email: 'admin@test.com'
            });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com',
                bountyBalance: 100
            });

            const quest = await createTestQuest(questGiver.id, {
                status: 'COMPLETED',
                claimedBy: player.id,
                bounty: 500
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('APPROVED');

            // Check if bounty was added to player
            const updatedPlayer = await getTestPrisma().user.findUnique({
                where: { id: player.id }
            });
            expect(updatedPlayer?.bountyBalance).toBe(600); // 100 + 500
        });

        it('should allow quest creator to approve their own quest', async () => {
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com',
                bountyBalance: 0
            });

            const quest = await createTestQuest(questGiver.id, {
                status: 'COMPLETED',
                claimedBy: player.id,
                bounty: 300
            });

            const token = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('APPROVED');

            // Check if bounty was added to player
            const updatedPlayer = await getTestPrisma().user.findUnique({
                where: { id: player.id }
            });
            expect(updatedPlayer?.bountyBalance).toBe(300);
        });

        it('should return 403 for non-admin/non-creator users', async () => {
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com'
            });
            const otherUser = await createTestUser({
                role: 'EDITOR',
                email: 'other@test.com'
            });

            const quest = await createTestQuest(questGiver.id, {
                status: 'COMPLETED',
                claimedBy: player.id,
                bounty: 200
            });

            const token = createTestToken(otherUser.id, otherUser.email, otherUser.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for quest not in COMPLETED status', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });

            const quest = await createTestQuest(questGiver.id, {
                status: 'AVAILABLE',
                bounty: 100
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('completed');
        });
    });

    describe('PUT /quests/:id/reject', () => {
        it('should allow admin to reject completed quest', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({
                role: 'PLAYER',
                email: 'player@test.com',
                bountyBalance: 100
            });

            const quest = await createTestQuest(questGiver.id, {
                status: 'COMPLETED',
                claimedBy: player.id,
                bounty: 200
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/reject`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    reason: 'Quest not completed satisfactorily'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('REJECTED');

            // Player balance should remain unchanged
            const updatedPlayer = await getTestPrisma().user.findUnique({
                where: { id: player.id }
            });
            expect(updatedPlayer?.bountyBalance).toBe(100);
        });

        it('should return 400 for missing rejection reason', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({ role: 'PLAYER' });

            const quest = await createTestQuest(questGiver.id, {
                status: 'COMPLETED',
                claimedBy: player.id,
                bounty: 150
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/reject`)
                .set('Authorization', `Bearer ${token}`)
                .send({}); // No reason provided

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /quests/pending-approval', () => {
        it('should return quests awaiting approval for admins', async () => {
            const admin = await createTestUser({ role: 'ADMIN' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({ role: 'PLAYER' });

            // Create quests with different statuses
            const pendingQuest1 = await createTestQuest(questGiver.id, {
                title: 'Pending Quest 1',
                status: 'COMPLETED',
                claimedBy: player.id,
                bounty: 100
            });
            const pendingQuest2 = await createTestQuest(questGiver.id, {
                title: 'Pending Quest 2',
                status: 'COMPLETED',
                claimedBy: player.id,
                bounty: 200
            });
            // These should not appear
            await createTestQuest(questGiver.id, {
                title: 'Available Quest',
                status: 'AVAILABLE',
                bounty: 50
            });
            await createTestQuest(questGiver.id, {
                title: 'Approved Quest',
                status: 'APPROVED',
                claimedBy: player.id,
                bounty: 150
            });

            const token = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .get('/quests/pending-approval')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quests).toHaveLength(2);

            const questTitles = response.body.data.quests.map((q: any) => q.title);
            expect(questTitles).toContain('Pending Quest 1');
            expect(questTitles).toContain('Pending Quest 2');
        });

        it('should return 403 for non-admin users', async () => {
            const player = await createTestUser({ role: 'PLAYER' });
            const token = createTestToken(player.id, player.email, player.role);

            const response = await request(app)
                .get('/quests/pending-approval')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });
});
