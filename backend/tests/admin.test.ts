// Set environment before importing app
process.env['NODE_ENV'] = 'test';

import request from 'supertest';
import { app } from '../src/index';
import {
    setupTestDatabase,
    clearTestData,
    createTestUser,
    createTestQuest,
    createTestToken,
    getTestPrisma,
    resetUserCounter
} from './setup';

jest.setTimeout(30000);

describe('Admin Quest Approval Endpoints', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    beforeEach(async () => {
        resetUserCounter(); // Reset counter FIRST to ensure unique emails
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

            // Create quest in available state
            const quest = await createTestQuest(questGiver.id, {
                bounty: 500,
                isRepeatable: true
            });

            const playerToken = createTestToken(player.id, player.email, player.role);

            // Player claims the quest
            await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${playerToken}`);

            // Player completes the quest
            await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${playerToken}`);

            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('AVAILABLE');

            // Check if bounty was added to player
            const updatedPlayer = await getTestPrisma().user.findUnique({
                where: { id: player.id }
            });
            expect(updatedPlayer?.bountyBalance).toBe(700); // 100 (initial) + 500 (quest) + 100 (level up bonus)
        });

        it('should allow quest creator to approve their own quest', async () => {
            resetUserCounter(); // Ensure unique emails for this test
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
                bounty: 300,
                isRepeatable: true
            });

            const playerToken = createTestToken(player.id, player.email, player.role);

            // Player claims and completes the quest
            await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${playerToken}`);
            await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${playerToken}`);

            const questGiverToken = createTestToken(questGiver.id, questGiver.email, questGiver.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${questGiverToken}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('AVAILABLE');

            // Check if bounty was added to player
            const updatedPlayer = await getTestPrisma().user.findUnique({
                where: { id: player.id }
            });
            expect(updatedPlayer?.bountyBalance).toBe(400); // 0 (initial) + 300 (quest) + 100 (level up bonus)
        });

        it('should return 403 for non-admin/non-creator users', async () => {
            resetUserCounter(); // Ensure unique emails for this test
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
                bounty: 200
            });

            const playerToken = createTestToken(player.id, player.email, player.role);
            // Player claims and completes the quest
            await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${playerToken}`);
            await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${playerToken}`);

            const otherUserToken = createTestToken(otherUser.id, otherUser.email, otherUser.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${otherUserToken}`)
                .send();

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });

        it('should return 400 for quest not in COMPLETED status', async () => {
            resetUserCounter(); // Ensure unique emails for this test
            const admin = await createTestUser({ role: 'ADMIN' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });

            const quest = await createTestQuest(questGiver.id, {
                bounty: 100
            });

            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send();

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toContain('pending approval');
        });
    });

    describe('PUT /quests/:id/reject', () => {
        it('should allow admin to reject completed quest', async () => {
            resetUserCounter(); // Ensure unique emails for this test
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
                bounty: 200
            });

            const playerToken = createTestToken(player.id, player.email, player.role);

            // Player claims and completes the quest
            await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${playerToken}`);
            await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${playerToken}`);

            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/reject`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    rejectionReason: 'Quest requirements not met.'
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('AVAILABLE');

            // Player balance should remain unchanged
            const updatedPlayer = await getTestPrisma().user.findUnique({
                where: { id: player.id }
            });
            expect(updatedPlayer?.bountyBalance).toBe(100);
        });

        it('should return 400 for missing rejection reason', async () => {
            resetUserCounter(); // Ensure unique emails for this test
            const admin = await createTestUser({ role: 'ADMIN' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({ role: 'PLAYER' });

            const quest = await createTestQuest(questGiver.id, {
                bounty: 150
            });

            const playerToken = createTestToken(player.id, player.email, player.role);

            // Player claims and completes the quest
            await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${playerToken}`);
            await request(app)
                .put(`/quests/${quest.id}/complete`)
                .set('Authorization', `Bearer ${playerToken}`);

            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            const response = await request(app)
                .put(`/quests/${quest.id}/reject`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({}); // No reason provided

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /quests/pending-approval', () => {
        it('should return quests awaiting approval for admins', async () => {
            resetUserCounter(); // Ensure unique emails for this test
            const admin = await createTestUser({ role: 'ADMIN' });
            const questGiver = await createTestUser({
                role: 'EDITOR',
                email: 'questgiver@test.com'
            });
            const player = await createTestUser({ role: 'PLAYER' });

            // Create quests with different statuses
            const pendingQuest1 = await createTestQuest(questGiver.id, {
                title: 'Pending Quest 1',
                status: 'PENDING_APPROVAL',
                claimedBy: player.id,
                bounty: 100
            });
            const pendingQuest2 = await createTestQuest(questGiver.id, {
                title: 'Pending Quest 2',
                status: 'PENDING_APPROVAL',
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

            console.log('Pending approval response:', response.body);
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
