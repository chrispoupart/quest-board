import axios from 'axios';
import { ApiResponse } from '../types';

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

export interface RewardConfig {
    id?: number;
    monthlyBountyReward: number;
    monthlyQuestReward: number;
    quarterlyCollectiveGoal: number;
    quarterlyCollectiveReward: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CollectiveProgress {
    goal: number;
    reward: string;
    progress: number;
    percent: number;
}

export const rewardsService = {
    /**
     * Get current reward configuration (admin only)
     */
    async getRewardConfig(): Promise<RewardConfig> {
        const response = await api.get<ApiResponse<RewardConfig>>('/api/rewards/config');

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch reward config');
        }

        return response.data.data!;
    },

    /**
     * Update reward configuration (admin only)
     */
    async updateRewardConfig(config: Omit<RewardConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
        const response = await api.post<ApiResponse<void>>('/api/rewards/config', config);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update reward config');
        }
    },

    /**
     * Get collective progress for a specific quarter
     */
    async getCollectiveProgress(quarter: string): Promise<CollectiveProgress> {
        const response = await api.get<ApiResponse<CollectiveProgress>>(`/api/rewards/collective-progress?quarter=${quarter}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch collective progress');
        }

        return response.data.data!;
    },

    /**
     * Get current quarter string in YYYY-QN format
     */
    getCurrentQuarter(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const quarter = Math.floor(month / 3) + 1;
        return `${year}-Q${quarter}`;
    }
};
