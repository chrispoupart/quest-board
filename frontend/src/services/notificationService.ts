import axios from 'axios';
import { ApiResponse } from '../types';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.PROD ? '' : '',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface Notification {
    id: number;
    userId: number;
    type: string;
    title: string;
    message: string;
    data?: string;
    isRead: boolean;
    createdAt: string;
    readAt?: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export const notificationService = {
    /**
     * Get user's notifications
     */
    async getNotifications(
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false
    ): Promise<NotificationResponse> {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(unreadOnly && { unreadOnly: 'true' })
        });

        const response = await api.get<ApiResponse<NotificationResponse>>(`/api/notifications?${params}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch notifications');
        }

        return response.data.data!;
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<number> {
        const response = await api.get<ApiResponse<{ count: number }>>('/api/notifications/unread-count');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch unread count');
        }

        return response.data.data!.count;
    },

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: number): Promise<void> {
        const response = await api.put<ApiResponse>(`/api/notifications/${notificationId}/read`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to mark notification as read');
        }
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        const response = await api.put<ApiResponse>('/api/notifications/mark-all-read');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to mark all notifications as read');
        }
    },

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: number): Promise<void> {
        const response = await api.delete<ApiResponse>(`/api/notifications/${notificationId}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to delete notification');
        }
    }
};
