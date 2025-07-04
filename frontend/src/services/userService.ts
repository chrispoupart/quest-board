import axios from 'axios';
import { User, ApiResponse } from '../types';

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

export const userService = {
    /**
     * Get all users (admin only)
     */
    async getAllUsers(): Promise<User[]> {
        const response = await api.get<ApiResponse<{ users: User[] }>>('/api/users');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch users');
        }

        return response.data.data!.users;
    },

    /**
     * Get user by ID (admin only)
     */
    async getUserById(id: number): Promise<User> {
        const response = await api.get<ApiResponse<User>>(`/api/users/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch user');
        }

        return response.data.data!;
    },

    /**
     * Update user role (admin only)
     */
    async updateUserRole(id: number, role: 'ADMIN' | 'EDITOR' | 'PLAYER'): Promise<User> {
        const response = await api.put<ApiResponse<User>>(`/api/users/${id}/role`, { role });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update user role');
        }

        return response.data.data!;
    },

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get<ApiResponse<{ user: User }>>('/api/users/me');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch current user');
        }

        return response.data.data!.user;
    },

    /**
     * Update current user profile
     */
    async updateCurrentUser(userData: {
        name?: string;
        email?: string;
        characterName?: string;
        avatarUrl?: string;
        characterClass?: string;
        characterBio?: string;
        preferredPronouns?: string;
        favoriteColor?: string;
        experience?: number;
    }): Promise<User> {
        const response = await api.put<ApiResponse<{ user: User }>>('/api/users/me', userData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update user profile');
        }

        return response.data.data!.user;
    },
};
