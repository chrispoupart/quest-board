import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
    /**
     * Get user's notifications
     */
    static async getUserNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 20;
            const unreadOnly = req.query['unreadOnly'] === 'true';

            const result = await NotificationService.getUserNotifications(
                userId,
                page,
                limit,
                unreadOnly
            );

            res.json({
                success: true,
                data: result
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting user notifications:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const notificationIdParam = req.params['id'];
            if (!notificationIdParam) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Notification ID is required' }
                } as ApiResponse);
                return;
            }

            const notificationId = parseInt(notificationIdParam);
            if (isNaN(notificationId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid notification ID' }
                } as ApiResponse);
                return;
            }

            await NotificationService.markAsRead(notificationId, userId);

            res.json({
                success: true,
                data: { message: 'Notification marked as read' }
            } as ApiResponse);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            await NotificationService.markAllAsRead(userId);

            res.json({
                success: true,
                data: { message: 'All notifications marked as read' }
            } as ApiResponse);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const count = await NotificationService.getUnreadCount(userId);

            res.json({
                success: true,
                data: { count }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting unread count:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Delete notification
     */
    static async deleteNotification(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const notificationIdParam = req.params['id'];
            if (!notificationIdParam) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Notification ID is required' }
                } as ApiResponse);
                return;
            }

            const notificationId = parseInt(notificationIdParam);
            if (isNaN(notificationId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid notification ID' }
                } as ApiResponse);
                return;
            }

            await NotificationService.deleteNotification(notificationId, userId);

            res.json({
                success: true,
                data: { message: 'Notification deleted' }
            } as ApiResponse);
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Clean up old notifications (admin only)
     */
    static async cleanupOldNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const daysOld = parseInt(req.query['daysOld'] as string) || 30;
            const deletedCount = await NotificationService.deleteOldNotifications(daysOld);

            res.json({
                success: true,
                data: {
                    message: `Cleaned up ${deletedCount} old notifications`,
                    deletedCount
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error cleaning up old notifications:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }
}
