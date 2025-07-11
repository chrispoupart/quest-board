import axios from 'axios';
import { ApiResponse, DashboardData, AdminDashboardData, UserStats } from '../types';

// In production, always use relative paths. In development, use the proxy.
const API_BASE_URL = import.meta.env.PROD ? '' : '';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: API_BASE_URL,
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

export const dashboardService = {
    /**
     * Get user dashboard data
     */
    async getUserDashboard(): Promise<DashboardData> {
        const response = await api.get<ApiResponse<DashboardData>>('/api/dashboard');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch dashboard data');
        }

        return response.data.data!;
    },

    /**
     * Get admin dashboard data
     */
    async getAdminDashboard(): Promise<AdminDashboardData> {
        const response = await api.get<ApiResponse<AdminDashboardData>>('/api/dashboard/admin');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch admin dashboard data');
        }

        return response.data.data!;
    },

    /**
     * Get user dashboard stats
     */
    async getUserStats(): Promise<UserStats> {
        const response = await api.get<ApiResponse<UserStats>>('/users/me/stats');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch user stats');
        }

        return response.data.data!;
    },

    /**
     * Get system health status
     */
    async getSystemHealth(): Promise<{
        status: string;
        uptime: number;
        database: string;
        jobs: string;
        lastCheck: string;
    }> {
        const response = await api.get<ApiResponse>('/jobs/health');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch system health');
        }

        return response.data.data!;
    },
};
