// Set environment before importing app
process.env['NODE_ENV'] = 'test';

import request from 'supertest';
import { app } from '../src/index';
import { PrismaClient } from '@prisma/client';
import { setupTestDatabase, clearTestData, createTestUser, createTestQuest, createTestToken, getTestPrisma, resetUserCounter } from './setup';

const prisma = new PrismaClient();

jest.setTimeout(30000);

describe('Repeatable Quest Functionality', () => {
    beforeAll(async () => {
        await setupTestDatabase();
    });

    beforeEach(async () => {
        resetUserCounter(); // Reset counter FIRST to ensure unique emails
        await clearTestData();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('Cooldown based on submission date', () => {
        it('should set cooldown based on completion date, not approval date', async () => {
            const admin = await createTestUser({ role: 'ADMIN', email: 'admin@test.com' });
            const questGiver = await createTestUser({ role: 'EDITOR', email: 'questgiver@test.com' });
            const player = await createTestUser({ role: 'PLAYER', email: 'player@test.com' });

            // Create a repeatable quest
            const quest = await createTestQuest(questGiver.id, {
                bounty: 100,
                isRepeatable: true,
                cooldownDays: 7
            });

            const playerToken = createTestToken(player.id, player.email, player.role);
            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            // Player claims the quest
            await request(app)
                .put(`/quests/${quest.id}/claim`)
                .set('Authorization', `Bearer ${playerToken}`);

            // Player completes the quest (this sets completedAt)
            const completionTime = new Date('2024-01-01T10:00:00Z');
            await prisma.quest.update({
                where: { id: quest.id },
                data: {
                    status: 'PENDING_APPROVAL',
                    completedAt: completionTime
                }
            });

            // Admin approves the quest
            const response = await request(app)
                .put(`/quests/${quest.id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.quest.status).toBe('COOLDOWN');

            // Check that lastCompletedAt is set to the completion date, not approval date
            const updatedQuest = await prisma.quest.findUnique({ where: { id: quest.id } });
            expect(updatedQuest?.lastCompletedAt).toEqual(completionTime);

            // Calculate when cooldown should end (based on completion date)
            const expectedCooldownEnd = new Date(completionTime.getTime() + 7 * 24 * 60 * 60 * 1000);
            expect(expectedCooldownEnd).toEqual(new Date('2024-01-08T10:00:00Z')); // 7 days from completion
        });
    });

    describe('Admin reset functionality', () => {
        it('should allow admin to reset repeatable quest from cooldown to available', async () => {
            const admin = await createTestUser({ role: 'ADMIN', email: 'admin@test.com' });
            const questGiver = await createTestUser({ role: 'EDITOR', email: 'questgiver@test.com' });
            const player = await createTestUser({ role: 'PLAYER', email: 'player@test.com' });

            // Create a repeatable quest in cooldown status
            const quest = await createTestQuest(questGiver.id, {
                bounty: 100,
                isRepeatable: true,
                cooldownDays: 7,
                status: 'COOLDOWN',
                lastCompletedAt: new Date('2024-01-01T10:00:00Z')
            });

            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            // Admin resets the quest
            const response = await request(app)
                .put(`/quests/${quest.id}/reset`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.quest.status).toBe('AVAILABLE');
            expect(response.body.data.quest.lastCompletedAt).toBeNull();
        });

        it('should not allow non-admin users to reset quests', async () => {
            const editor = await createTestUser({ role: 'EDITOR', email: 'editor@test.com' });
            const questGiver = await createTestUser({ role: 'EDITOR', email: 'questgiver@test.com' });

            // Create a repeatable quest in cooldown status
            const quest = await createTestQuest(questGiver.id, {
                bounty: 100,
                isRepeatable: true,
                cooldownDays: 7,
                status: 'COOLDOWN',
                lastCompletedAt: new Date('2024-01-01T10:00:00Z')
            });

            const editorToken = createTestToken(editor.id, editor.email, editor.role);

            // Editor tries to reset the quest
            const response = await request(app)
                .put(`/quests/${quest.id}/reset`)
                .set('Authorization', `Bearer ${editorToken}`);

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Access denied. Admin role required.');
        });

        it('should not allow resetting non-repeatable quests', async () => {
            const admin = await createTestUser({ role: 'ADMIN', email: 'admin@test.com' });
            const questGiver = await createTestUser({ role: 'EDITOR', email: 'questgiver@test.com' });

            // Create a non-repeatable quest in cooldown status
            const quest = await createTestQuest(questGiver.id, {
                bounty: 100,
                isRepeatable: false,
                status: 'COOLDOWN',
                lastCompletedAt: new Date('2024-01-01T10:00:00Z')
            });

            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            // Admin tries to reset the quest
            const response = await request(app)
                .put(`/quests/${quest.id}/reset`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Only repeatable quests can be reset');
        });

        it('should not allow resetting quests that are not in cooldown', async () => {
            const admin = await createTestUser({ role: 'ADMIN', email: 'admin@test.com' });
            const questGiver = await createTestUser({ role: 'EDITOR', email: 'questgiver@test.com' });

            // Create a repeatable quest in available status
            const quest = await createTestQuest(questGiver.id, {
                bounty: 100,
                isRepeatable: true,
                cooldownDays: 7,
                status: 'AVAILABLE'
            });

            const adminToken = createTestToken(admin.id, admin.email, admin.role);

            // Admin tries to reset the quest
            const response = await request(app)
                .put(`/quests/${quest.id}/reset`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Quest is not in cooldown status');
        });
    });
});
