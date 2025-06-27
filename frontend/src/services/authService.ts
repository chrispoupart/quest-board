import axios from 'axios';
import { User, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

// Add response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Retry the original request
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export const authService = {
    /**
     * Login with Google OAuth2 code
     */
    async login(code: string, redirectUri: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
        try {
            const response = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>('/auth/google', {
                code,
                redirectUri,
            });

            if (!response.data.success) {
                throw new Error(response.data.error?.message || 'Login failed');
            }

            return response.data.data!;
        } catch (error) {
            console.error('Login API error:', error);
            if (axios.isAxiosError(error)) {
                console.error('Response data:', error.response?.data);
                console.error('Response status:', error.response?.status);
            }
            throw error;
        }
    },

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Log error but don't throw - we want to clear local state regardless
            console.error('Logout API call failed:', error);
        }
    },

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/users/me');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to get user profile');
        }

        return response.data.data!;
    },

    /**
     * Update current user profile
     */
    async updateProfile(updateData: { name?: string; email?: string }): Promise<User> {
        const response = await api.put<ApiResponse<User>>('/users/me', updateData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update profile');
        }

        return response.data.data!;
    },

    /**
     * Get user statistics
     */
    async getUserStats(): Promise<{
        totalQuests: number;
        completedQuests: number;
        currentQuests: number;
        pendingApproval: number;
        totalBounty: number;
        averageBounty: number;
    }> {
        const response = await api.get<ApiResponse>('/users/me/stats');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to get user stats');
        }

        return response.data.data!;
    },

    /**
     * Refresh access token
     */
    async refreshToken(): Promise<{ accessToken: string; user: User }> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await api.post<ApiResponse<{ accessToken: string; user: User }>>('/auth/refresh', {
            refreshToken,
        });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Token refresh failed');
        }

        return response.data.data!;
    },
};
