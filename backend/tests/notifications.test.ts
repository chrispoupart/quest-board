import request from 'supertest';
import { Express } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from '../src/middleware/errorHandler';
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import questRoutes from '../src/routes/quests';
import dashboardRoutes from '../src/routes/dashboard';
import jobRoutes from '../src/routes/jobs';
import storeRoutes from '../src/routes/store';
import skillRoutes from '../src/routes/skills';
import notificationRoutes from '../src/routes/notifications';
import {
    setupTestDatabase,
    teardownTestDatabase,
    clearTestData,
    createTestUser,
    createTestToken,
    getTestPrisma
} from './setup';
import { NotificationService } from '../src/services/notificationService';

// Create test app
const createTestApp = (): Express => {
    const app = express();

    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/auth', authRoutes);
    app.use('/users', userRoutes);
    app.use('/quests', questRoutes);
    app.use('/dashboard', dashboardRoutes);
    app.use('/jobs', jobRoutes);
    app.use('/store', storeRoutes);
    app.use('/skills', skillRoutes);
    app.use('/notifications', notificationRoutes);

    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Error handling
    app.use(errorHandler);

    return app;
};

describe('Notification System', () => {
    let server: Express;

    beforeAll(async () => {
        await setupTestDatabase();
        server = createTestApp();
    });

    afterAll(async () => {
        await teardownTestDatabase();
    });

    beforeEach(async () => {
        await clearTestData();
    });

    describe('Notification Endpoints', () => {
        let user: any;
        let adminUser: any;
        let userToken: string;
        let adminToken: string;

        beforeEach(async () => {
            // Create test users
            user = await createTestUser({
                name: 'Test User',
                email: 'test@example.com',
                role: 'PLAYER'
            });

            adminUser = await createTestUser({
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'ADMIN'
            });

            userToken = createTestToken(user.id, user.email, user.role);
            adminToken = createTestToken(adminUser.id, adminUser.email, adminUser.role);
        });

        describe('GET /notifications', () => {
            it('should return 401 for unauthenticated requests', async () => {
                const response = await request(server)
                    .get('/notifications');

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
            });

            it('should return empty notifications for new user', async () => {
                const response = await request(server)
                    .get('/notifications')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.notifications).toEqual([]);
                expect(response.body.data.pagination.total).toBe(0);
            });

            it('should return user notifications', async () => {
                // Create a test notification
                const prisma = getTestPrisma();
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'QUEST_APPROVED',
                        title: 'Test Notification',
                        message: 'This is a test notification',
                        isRead: false
                    }
                });

                const response = await request(server)
                    .get('/notifications')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.notifications).toHaveLength(1);
                expect(response.body.data.notifications[0]?.title).toBe('Test Notification');
            });

            it('should filter unread notifications', async () => {
                // Create test notifications
                const prisma = getTestPrisma();
                await prisma.notification.createMany({
                    data: [
                        {
                            userId: user.id,
                            type: 'QUEST_APPROVED',
                            title: 'Read Notification',
                            message: 'This is read',
                            isRead: true
                        },
                        {
                            userId: user.id,
                            type: 'QUEST_REJECTED',
                            title: 'Unread Notification',
                            message: 'This is unread',
                            isRead: false
                        }
                    ]
                });

                const response = await request(server)
                    .get('/notifications?unreadOnly=true')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.notifications).toHaveLength(1);
                expect(response.body.data.notifications[0]?.title).toBe('Unread Notification');
            });
        });

        describe('GET /notifications/unread-count', () => {
            it('should return unread count', async () => {
                // Create test notifications
                const prisma = getTestPrisma();
                await prisma.notification.createMany({
                    data: [
                        {
                            userId: user.id,
                            type: 'QUEST_APPROVED',
                            title: 'Read Notification',
                            message: 'This is read',
                            isRead: true
                        },
                        {
                            userId: user.id,
                            type: 'QUEST_REJECTED',
                            title: 'Unread Notification',
                            message: 'This is unread',
                            isRead: false
                        },
                        {
                            userId: user.id,
                            type: 'LEVEL_UP',
                            title: 'Another Unread',
                            message: 'Also unread',
                            isRead: false
                        }
                    ]
                });

                const response = await request(server)
                    .get('/notifications/unread-count')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.count).toBe(2);
            });
        });

        describe('PUT /notifications/:id/read', () => {
            it('should mark notification as read', async () => {
                // Create a test notification
                const prisma = getTestPrisma();
                const notification = await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'QUEST_APPROVED',
                        title: 'Test Notification',
                        message: 'This is a test notification',
                        isRead: false
                    }
                });

                const response = await request(server)
                    .put(`/notifications/${notification.id}/read`)
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                // Verify notification is marked as read
                const updatedNotification = await prisma.notification.findUnique({
                    where: { id: notification.id }
                });
                expect(updatedNotification?.isRead).toBe(true);
                expect(updatedNotification?.readAt).toBeDefined();
            });

            it('should return 200 for non-existent notification', async () => {
                const response = await request(server)
                    .put('/notifications/999/read')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200); // The endpoint doesn't return 404, it just doesn't update anything
            });
        });

        describe('PUT /notifications/mark-all-read', () => {
            it('should mark all notifications as read', async () => {
                // Create test notifications
                const prisma = getTestPrisma();
                await prisma.notification.createMany({
                    data: [
                        {
                            userId: user.id,
                            type: 'QUEST_APPROVED',
                            title: 'Notification 1',
                            message: 'First notification',
                            isRead: false
                        },
                        {
                            userId: user.id,
                            type: 'QUEST_REJECTED',
                            title: 'Notification 2',
                            message: 'Second notification',
                            isRead: false
                        }
                    ]
                });

                const response = await request(server)
                    .put('/notifications/mark-all-read')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                // Verify all notifications are marked as read
                const notifications = await prisma.notification.findMany({
                    where: { userId: user.id }
                });
                expect(notifications).toHaveLength(2);
                expect(notifications.every(n => n.isRead)).toBe(true);
            });
        });

        describe('DELETE /notifications/:id', () => {
            it('should delete notification', async () => {
                // Create a test notification
                const prisma = getTestPrisma();
                const notification = await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: 'QUEST_APPROVED',
                        title: 'Test Notification',
                        message: 'This is a test notification',
                        isRead: false
                    }
                });

                const response = await request(server)
                    .delete(`/notifications/${notification.id}`)
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);

                // Verify notification is deleted
                const deletedNotification = await prisma.notification.findUnique({
                    where: { id: notification.id }
                });
                expect(deletedNotification).toBeNull();
            });
        });

        describe('DELETE /notifications/cleanup/old (Admin Only)', () => {
            it('should return 403 for non-admin users', async () => {
                const response = await request(server)
                    .delete('/notifications/cleanup/old')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(response.status).toBe(403);
                expect(response.body.success).toBe(false);
            });

            it('should cleanup old notifications for admin users', async () => {
                // Create old read notifications
                const prisma = getTestPrisma();
                const oldDate = new Date();
                oldDate.setDate(oldDate.getDate() - 31); // 31 days old

                await prisma.notification.createMany({
                    data: [
                        {
                            userId: user.id,
                            type: 'QUEST_APPROVED',
                            title: 'Old Notification',
                            message: 'This is old',
                            isRead: true,
                            createdAt: oldDate
                        },
                        {
                            userId: user.id,
                            type: 'QUEST_REJECTED',
                            title: 'New Notification',
                            message: 'This is new',
                            isRead: false
                        }
                    ]
                });

                const response = await request(server)
                    .delete('/notifications/cleanup/old')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.data.deletedCount).toBe(1);

                // Verify old notification is deleted but new one remains
                const remainingNotifications = await prisma.notification.findMany({
                    where: { userId: user.id }
                });
                expect(remainingNotifications).toHaveLength(1);
                expect(remainingNotifications[0]?.title).toBe('New Notification');
            });
        });
    });

    describe('Notification Service Integration', () => {
        let user: any;
        let adminUser: any;

        beforeEach(async () => {
            user = await createTestUser({
                name: 'Test User',
                email: 'test@example.com',
                role: 'PLAYER'
            });

            adminUser = await createTestUser({
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'ADMIN'
            });
        });

        it('should create quest approval notification', async () => {
            await NotificationService.createQuestApprovalNotification(
                user.id,
                1,
                'Test Quest',
                100,
                50
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('QUEST_APPROVED');
            expect(notifications[0]?.title).toBe('Quest Approved! 🎉');
            expect(notifications[0]?.message).toContain('Test Quest');
            expect(notifications[0]?.message).toContain('100 bounty');
            expect(notifications[0]?.message).toContain('50 experience');
        });

        it('should create quest rejection notification', async () => {
            await NotificationService.createQuestRejectionNotification(
                user.id,
                1,
                'Test Quest',
                'Not detailed enough'
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('QUEST_REJECTED');
            expect(notifications[0]?.title).toBe('Quest Rejected');
            expect(notifications[0]?.message).toContain('Test Quest');
            expect(notifications[0]?.message).toContain('Not detailed enough');
        });

        it('should create store purchase notification', async () => {
            await NotificationService.createStorePurchaseNotification(
                user.id,
                1,
                'Magic Sword',
                150
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('STORE_PURCHASE');
            expect(notifications[0]?.title).toBe('Purchase Requested');
            expect(notifications[0]?.message).toContain('Magic Sword');
            expect(notifications[0]?.message).toContain('150 bounty');
        });

        it('should create store approval notification', async () => {
            await NotificationService.createStoreApprovalNotification(
                user.id,
                1,
                'Magic Sword',
                123
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('STORE_APPROVED');
            expect(notifications[0]?.title).toBe('Purchase Approved! 🛒');
            expect(notifications[0]?.message).toContain('Magic Sword');
        });

        it('should create store rejection notification', async () => {
            await NotificationService.createStoreRejectionNotification(
                user.id,
                1,
                'Magic Sword',
                123,
                'Out of stock'
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('STORE_REJECTED');
            expect(notifications[0]?.title).toBe('Purchase Rejected');
            expect(notifications[0]?.message).toContain('Magic Sword');
            expect(notifications[0]?.message).toContain('Out of stock');
        });

        it('should create level up notification', async () => {
            await NotificationService.createLevelUpNotification(
                user.id,
                5,
                1250
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('LEVEL_UP');
            expect(notifications[0]?.title).toBe('Level Up! 🎊 Level 5');
            expect(notifications[0]?.message).toContain('level 5');
            expect(notifications[0]?.message).toContain('1250 total experience');
        });

        it('should create quest claimed notification', async () => {
            await NotificationService.createQuestClaimedNotification(
                user.id,
                1,
                'Test Quest',
                'Adventurer Bob'
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('QUEST_CLAIMED');
            expect(notifications[0]?.title).toBe('Quest Claimed! ⚔️');
            expect(notifications[0]?.message).toContain('Adventurer Bob');
            expect(notifications[0]?.message).toContain('Test Quest');
        });

        it('should create quest completed notification', async () => {
            await NotificationService.createQuestCompletedNotification(
                user.id,
                1,
                'Test Quest',
                'Adventurer Bob'
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: user.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('QUEST_COMPLETED');
            expect(notifications[0]?.title).toBe('Quest Completed! ✅');
            expect(notifications[0]?.message).toContain('Adventurer Bob');
            expect(notifications[0]?.message).toContain('Test Quest');
        });

        it('should create admin approval notification', async () => {
            await NotificationService.createAdminApprovalNotification(
                adminUser.id,
                3,
                2
            );

            const prisma = getTestPrisma();
            const notifications = await prisma.notification.findMany({
                where: { userId: adminUser.id }
            });

            expect(notifications).toHaveLength(1);
            expect(notifications[0]?.type).toBe('ADMIN_APPROVAL_NEEDED');
            expect(notifications[0]?.title).toBe('Approval Required! ⏰');
            expect(notifications[0]?.message).toContain('5 items awaiting your approval');
            expect(notifications[0]?.message).toContain('3 quest completions and 2 store purchases');
        });

        it('should notify all admins of pending approvals', async () => {
            // Create another admin
            const adminUser2 = await createTestUser({
                name: 'Admin User 2',
                email: 'admin2@example.com',
                role: 'ADMIN'
            });

            // Create some pending quests and store transactions
            const prisma = getTestPrisma();
            await prisma.quest.create({
                data: {
                    title: 'Test Quest',
                    description: 'Test description',
                    bounty: 100,
                    status: 'COMPLETED',
                    createdBy: user.id,
                    claimedBy: user.id,
                    completedAt: new Date()
                }
            });

            const seller = await createTestUser({
                name: 'Shopkeeper',
                email: 'shopkeeper@test.com',
                role: 'EDITOR'
            });

            // Create a store item first
            const storeItem = await prisma.storeItem.create({
                data: {
                    name: 'Test Item',
                    description: 'A test item for notifications',
                    cost: 100,
                    createdBy: seller.id
                }
            });

            await prisma.storeTransaction.create({
                data: {
                    itemId: storeItem.id,
                    buyerId: user.id,
                    sellerId: seller.id,
                    amount: 100,
                    status: 'PENDING'
                }
            });

            await NotificationService.notifyAdminsOfPendingApprovals();

            // Check that both admins received notifications
            const admin1Notifications = await prisma.notification.findMany({
                where: { userId: adminUser.id }
            });
            const admin2Notifications = await prisma.notification.findMany({
                where: { userId: adminUser2.id }
            });

            expect(admin1Notifications).toHaveLength(1);
            expect(admin2Notifications).toHaveLength(1);
            expect(admin1Notifications[0]?.type).toBe('ADMIN_APPROVAL_NEEDED');
            expect(admin2Notifications[0]?.type).toBe('ADMIN_APPROVAL_NEEDED');
        });
    });

    describe('Scheduled Job Integration', () => {
        it('should trigger the scheduled job and notify all admins of pending approvals', async () => {
            // Create two admin users
            const adminUser1 = await createTestUser({
                name: 'Admin User 1',
                email: 'admin1-jobtest@example.com',
                role: 'ADMIN'
            });
            const adminUser2 = await createTestUser({
                name: 'Admin User 2',
                email: 'admin2-jobtest@example.com',
                role: 'ADMIN'
            });
            // Create a user and a pending quest
            const player = await createTestUser({
                name: 'Player',
                email: 'player-jobtest@example.com',
                role: 'PLAYER'
            });
            const prisma = getTestPrisma();
            await prisma.quest.create({
                data: {
                    title: 'Job Test Quest',
                    description: 'Job test description',
                    bounty: 50,
                    status: 'COMPLETED',
                    createdBy: player.id,
                    claimedBy: player.id,
                    completedAt: new Date()
                }
            });
            // Create a store item and a pending transaction
            const seller = await createTestUser({
                name: 'Seller',
                email: 'seller-jobtest@example.com',
                role: 'EDITOR'
            });
            const storeItem = await prisma.storeItem.create({
                data: {
                    name: 'Job Test Item',
                    description: 'Job test item',
                    cost: 75,
                    createdBy: seller.id
                }
            });
            await prisma.storeTransaction.create({
                data: {
                    itemId: storeItem.id,
                    buyerId: player.id,
                    sellerId: seller.id,
                    amount: 75,
                    status: 'PENDING'
                }
            });
            // Import JobService and call the handler directly
            const { JobService } = await import('../src/services/jobService');
            await JobService['handleNotifyAdminsPendingApprovals']();
            // Check that both admins received notifications
            const admin1Notifications = await prisma.notification.findMany({ where: { userId: adminUser1.id, type: 'ADMIN_APPROVAL_NEEDED' } });
            const admin2Notifications = await prisma.notification.findMany({ where: { userId: adminUser2.id, type: 'ADMIN_APPROVAL_NEEDED' } });
            expect(admin1Notifications.length).toBeGreaterThanOrEqual(1);
            expect(admin2Notifications.length).toBeGreaterThanOrEqual(1);
            expect(admin1Notifications[0]?.message).toContain('items awaiting your approval');
            expect(admin2Notifications[0]?.message).toContain('items awaiting your approval');
        });
    });
});
