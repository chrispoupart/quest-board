import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Bell } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { usePushNotifications } from '../hooks/usePushNotifications';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lastUnreadCount, setLastUnreadCount] = useState(0);

    const {
        isSupported,
        permission,
        requestPermission,
        showQuestNotification
    } = usePushNotifications();

    const fetchUnreadCount = async () => {
        try {
            setLoading(true);
            const count = await notificationService.getUnreadCount();

            // Check if there are new notifications
            if (count > lastUnreadCount && lastUnreadCount > 0) {
                const newCount = count - lastUnreadCount;
                console.log(`You have ${newCount} new notification(s)!`);

                // Show push notification if permission is granted
                if (permission === 'granted') {
                    showQuestNotification(
                        'New Notifications',
                        `You have ${newCount} new notification${newCount > 1 ? 's' : ''}!`
                    );
                }
            }

            setUnreadCount(count);
            setLastUnreadCount(count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [lastUnreadCount, permission]);

    const handleNotificationCenterClose = () => {
        setIsNotificationCenterOpen(false);
        // Refresh unread count when notification center is closed
        fetchUnreadCount();
    };

    const handleBellClick = async () => {
        // Request notification permission if not granted
        if (isSupported && permission !== 'granted') {
            const granted = await requestPermission();
            if (granted) {
                console.log('Notification permission granted!');
            }
        }

        setIsNotificationCenterOpen(true);
    };

    return (
        <>
            <div className="relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBellClick}
                    className="relative h-9 w-9 p-0"
                    disabled={loading}
                    title={permission !== 'granted' && isSupported ? 'Click to enable push notifications' : 'Notifications'}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-medium"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                    {permission !== 'granted' && isSupported && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                </Button>
            </div>

            <NotificationCenter
                isOpen={isNotificationCenterOpen}
                onClose={handleNotificationCenterClose}
            />
        </>
    );
};

export default NotificationBell;
