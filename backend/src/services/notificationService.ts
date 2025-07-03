import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../db';

export type PrismaTransactionalClient = Prisma.TransactionClient;

export interface NotificationData {
    questId?: number;
    storeItemId?: number;
    transactionId?: number;
    bounty?: number;
    experience?: number;
    level?: number;
    [key: string]: any;
}

export type NotificationType =
    | 'QUEST_APPROVED'
    | 'QUEST_REJECTED'
    | 'QUEST_CLAIMED'
    | 'STORE_PURCHASE'
    | 'STORE_APPROVED'
    | 'STORE_REJECTED'
    | 'LEVEL_UP'
    | 'SKILL_LEVEL_UP'
    | 'QUEST_COMPLETED'
    | 'QUEST_AVAILABLE'
    | 'ADMIN_APPROVAL_NEEDED'
    | 'SYSTEM_MESSAGE';

export class NotificationService {
    /**
     * Create a new notification
     */
    static async createNotification(
        userId: number,
        type: NotificationType,
        title: string,
        message: string,
        data?: NotificationData,
        tx?: PrismaTransactionalClient
    ): Promise<void> {
        const db = tx || prisma;
        try {
            await db.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    data: data ? JSON.stringify(data) : null,
                }
            });
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Get user's notifications
     */
    static async getUserNotifications(
        userId: number,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false
    ) {
        const skip = (page - 1) * limit;

        const where: any = { userId };
        if (unreadOnly) {
            where.isRead = false;
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.notification.count({ where })
        ]);

        return {
            notifications,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId: number, userId: number): Promise<void> {
        await prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    }

    /**
     * Mark all user notifications as read
     */
    static async markAllAsRead(userId: number): Promise<void> {
        await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(userId: number): Promise<number> {
        return await prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });
    }

    /**
     * Delete notification
     */
    static async deleteNotification(notificationId: number, userId: number): Promise<void> {
        await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId
            }
        });
    }

    /**
     * Delete old notifications (cleanup)
     */
    static async deleteOldNotifications(daysOld: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await prisma.notification.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate
                },
                isRead: true
            }
        });

        return result.count;
    }

    /**
     * Create quest approval notification
     */
    static async createQuestApprovalNotification(
        userId: number,
        questId: number,
        questTitle: string,
        bounty: number,
        experience: number
    ): Promise<void> {
        await this.createNotification(
            userId,
            'QUEST_APPROVED',
            'Quest Approved! 🎉',
            `Your quest "${questTitle}" has been approved! You earned ${bounty} bounty and ${experience} experience.`,
            { questId, bounty, experience }
        );
    }

    /**
     * Create quest rejection notification
     */
    static async createQuestRejectionNotification(
        userId: number,
        questId: number,
        questTitle: string,
        notes?: string
    ): Promise<void> {
        const message = notes
            ? `Your quest "${questTitle}" was rejected. Reason: ${notes}`
            : `Your quest "${questTitle}" was rejected. Please review and try again.`;

        await this.createNotification(
            userId,
            'QUEST_REJECTED',
            'Quest Rejected',
            message,
            { questId, notes }
        );
    }

    /**
     * Create store purchase notification
     */
    static async createStorePurchaseNotification(
        userId: number,
        itemId: number,
        itemName: string,
        cost: number
    ): Promise<void> {
        await this.createNotification(
            userId,
            'STORE_PURCHASE',
            'Purchase Requested',
            `Your purchase request for "${itemName}" (${cost} bounty) has been submitted and is pending approval.`,
            { storeItemId: itemId, cost }
        );
    }

    /**
     * Create store approval notification
     */
    static async createStoreApprovalNotification(
        userId: number,
        itemId: number,
        itemName: string,
        transactionId: number
    ): Promise<void> {
        await this.createNotification(
            userId,
            'STORE_APPROVED',
            'Purchase Approved! 🛒',
            `Your purchase of "${itemName}" has been approved!`,
            { storeItemId: itemId, transactionId }
        );
    }

    /**
     * Create store rejection notification
     */
    static async createStoreRejectionNotification(
        userId: number,
        itemId: number,
        itemName: string,
        transactionId: number,
        notes?: string
    ): Promise<void> {
        const message = notes
            ? `Your purchase of "${itemName}" was rejected. Reason: ${notes}`
            : `Your purchase of "${itemName}" was rejected.`;

        await this.createNotification(
            userId,
            'STORE_REJECTED',
            'Purchase Rejected',
            message,
            { storeItemId: itemId, transactionId, notes }
        );
    }

    /**
     * Create level up notification
     */
    static async createLevelUpNotification(
        userId: number,
        newLevel: number,
        experience: number
    ): Promise<void> {
        await this.createNotification(
            userId,
            'LEVEL_UP',
            `Level Up! 🎊 Level ${newLevel}`,
            `Congratulations! You've reached level ${newLevel} with ${experience} total experience!`,
            { level: newLevel, experience }
        );
    }

    /**
     * Create quest claimed notification
     */
    static async createQuestClaimedNotification(
        questCreatorId: number,
        questId: number,
        questTitle: string,
        claimerName: string
    ): Promise<void> {
        await this.createNotification(
            questCreatorId,
            'QUEST_CLAIMED',
            'Quest Claimed! ⚔️',
            `${claimerName} has claimed your quest "${questTitle}".`,
            { questId, claimerName }
        );
    }

    /**
     * Create quest completed notification
     */
    static async createQuestCompletedNotification(
        questCreatorId: number,
        questId: number,
        questTitle: string,
        claimerName: string
    ): Promise<void> {
        await this.createNotification(
            questCreatorId,
            'QUEST_COMPLETED',
            'Quest Completed! ✅',
            `${claimerName} has completed your quest "${questTitle}" and is waiting for approval.`,
            { questId, claimerName }
        );
    }

    /**
     * Create admin approval needed notification
     */
    static async createAdminApprovalNotification(
        adminUserId: number,
        pendingQuests: number,
        pendingStoreItems: number
    ): Promise<void> {
        const totalPending = pendingQuests + pendingStoreItems;
        const message = totalPending === 1
            ? 'There is 1 item awaiting your approval.'
            : `There are ${totalPending} items awaiting your approval.`;

        const details = [];
        if (pendingQuests > 0) {
            details.push(`${pendingQuests} quest completion${pendingQuests > 1 ? 's' : ''}`);
        }
        if (pendingStoreItems > 0) {
            details.push(`${pendingStoreItems} store purchase${pendingStoreItems > 1 ? 's' : ''}`);
        }

        const fullMessage = `${message} ${details.join(' and ')}. Please review them in the admin panel.`;

        await this.createNotification(
            adminUserId,
            'ADMIN_APPROVAL_NEEDED',
            'Approval Required! ⏰',
            fullMessage,
            { pendingQuests, pendingStoreItems, totalPending }
        );
    }

    /**
     * Notify all admins about pending approvals
     */
    static async notifyAdminsOfPendingApprovals(): Promise<void> {
        try {
            // Get counts of pending items
            const [pendingQuests, pendingStoreItems] = await Promise.all([
                prisma.quest.count({
                    where: { status: 'COMPLETED' }
                }),
                prisma.storeTransaction.count({
                    where: { status: 'PENDING' }
                })
            ]);

            // If there are pending items, notify all admins
            if (pendingQuests > 0 || pendingStoreItems > 0) {
                const admins = await prisma.user.findMany({
                    where: { role: 'ADMIN' },
                    select: { id: true }
                });

                // Send notification to each admin
                for (const admin of admins) {
                    await this.createAdminApprovalNotification(
                        admin.id,
                        pendingQuests,
                        pendingStoreItems
                    );
                }

                console.log(`Notified ${admins.length} admins about ${pendingQuests} pending quests and ${pendingStoreItems} pending store items`);
            }
        } catch (error) {
            console.error('Error notifying admins of pending approvals:', error);
        }
    }
}
