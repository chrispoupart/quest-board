import React, { useState, useEffect } from 'react';
import { notificationService, Notification } from '../services/notificationService';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
    Bell,
    CheckCircle,
    X,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCheck,
    ShoppingCart,
    Trophy,
    Sword,
    Star
} from 'lucide-react';

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchNotifications = async (pageNum: number = 1, append: boolean = false) => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getNotifications(pageNum, 20);

            if (append) {
                setNotifications(prev => [...prev, ...response.notifications]);
            } else {
                setNotifications(response.notifications);
            }

            setHasMore(pageNum < response.pagination.totalPages);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications(1, false);
            fetchUnreadCount();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true, readAt: new Date().toISOString() }
                        : notif
                )
            );
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    const handleDeleteNotification = async (notificationId: number) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchNotifications(nextPage, true);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'QUEST_APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'QUEST_REJECTED':
                return <X className="w-5 h-5 text-red-600" />;
            case 'QUEST_CLAIMED':
                return <Sword className="w-5 h-5 text-blue-600" />;
            case 'QUEST_COMPLETED':
                return <CheckCheck className="w-5 h-5 text-blue-600" />;
            case 'STORE_PURCHASE':
                return <ShoppingCart className="w-5 h-5 text-orange-600" />;
            case 'STORE_APPROVED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'STORE_REJECTED':
                return <X className="w-5 h-5 text-red-600" />;
            case 'LEVEL_UP':
                return <Trophy className="w-5 h-5 text-yellow-600" />;
            case 'SKILL_LEVEL_UP':
                return <Star className="w-5 h-5 text-purple-600" />;
            case 'ADMIN_APPROVAL_NEEDED':
                return <AlertCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="text-xs"
                            >
                                Mark all read
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {error && (
                        <div className="flex items-center gap-2 text-destructive mb-4">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <Card
                                    key={notification.id}
                                    className={`transition-colors ${
                                        !notification.isRead
                                            ? 'border-primary/20 bg-primary/5'
                                            : 'border-border'
                                    }`}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm">
                                                            {notification.title}
                                                        </h4>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {formatTime(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {!notification.isRead && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleMarkAsRead(notification.id)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <CheckCircle className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteNotification(notification.id)}
                                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {hasMore && (
                                <div className="text-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="w-full"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : null}
                                        Load More
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;
