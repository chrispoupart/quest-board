import { useState, useEffect, useCallback } from 'react';

export const usePushNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        setIsSupported('Notification' in window);

        if (isSupported) {
            setPermission(Notification.permission);
        }
    }, [isSupported]);

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            console.warn('Notifications not supported in this browser');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }, [isSupported]);

    const showNotification = useCallback((title: string, options?: NotificationOptions) => {
        if (!isSupported || permission !== 'granted') {
            return;
        }

        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options,
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

            // Handle click
            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }, [isSupported, permission]);

    const showQuestNotification = useCallback((title: string, message: string) => {
        showNotification(title, {
            body: message,
            tag: 'quest-notification',
            requireInteraction: false,
        });
    }, [showNotification]);

    const showStoreNotification = useCallback((title: string, message: string) => {
        showNotification(title, {
            body: message,
            tag: 'store-notification',
            requireInteraction: false,
        });
    }, [showNotification]);

    const showLevelUpNotification = useCallback((title: string, message: string) => {
        showNotification(title, {
            body: message,
            tag: 'level-up-notification',
            requireInteraction: true, // Level up notifications are important
        });
    }, [showNotification]);

    return {
        isSupported,
        permission,
        requestPermission,
        showNotification,
        showQuestNotification,
        showStoreNotification,
        showLevelUpNotification,
    };
};
