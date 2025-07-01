import { Router } from 'express';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware';
import { NotificationController } from '../controllers/notificationController';

const router = Router();

// Get all notifications for the authenticated user
router.get('/', authMiddleware, NotificationController.getUserNotifications);

// Get the count of unread notifications
router.get('/unread-count', authMiddleware, NotificationController.getUnreadCount);

// Mark a single notification as read
router.put('/:id/read', authMiddleware, NotificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware, NotificationController.markAllAsRead);

// Delete a single notification
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);

// Clean up old notifications (admin only)
router.delete('/cleanup/old', authMiddleware, isAdmin, NotificationController.cleanupOldNotifications);

export default router;
