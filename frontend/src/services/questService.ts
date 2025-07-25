import axios from 'axios';
import { Quest, ApiResponse, CreateQuestRequest, UpdateQuestRequest, QuestListingResponse } from '../types';

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

export const questService = {
    /**
     * Get all quests with optional filters
     */
    async getQuests(params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        createdBy?: number;
        claimedBy?: number;
    }): Promise<QuestListingResponse> {
        const response = await api.get<ApiResponse<QuestListingResponse>>('/api/quests', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch quests');
        }

        return response.data.data!;
    },

    /**
     * Get quest by ID
     */
    async getQuestById(id: number): Promise<Quest> {
        const response = await api.get<ApiResponse<Quest>>(`/api/quests/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch quest');
        }

        return response.data.data!;
    },

    /**
     * Create a new quest
     */
    async createQuest(questData: CreateQuestRequest): Promise<Quest> {
        const response = await api.post<ApiResponse<Quest>>('/api/quests', questData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to create quest');
        }

        return response.data.data!;
    },

    /**
     * Create a new quest with skills
     */
    async createQuestWithSkills(questData: CreateQuestRequest & { skillRequirements?: Array<{ skillId: number; minLevel: number }> }): Promise<Quest> {
        const response = await api.post<ApiResponse<Quest>>('/api/quests/with-skills', questData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to create quest with skills');
        }

        return response.data.data!;
    },

    /**
     * Update quest
     */
    async updateQuest(id: number, questData: UpdateQuestRequest): Promise<Quest> {
        const response = await api.put<ApiResponse<Quest>>(`/api/quests/${id}`, questData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update quest');
        }

        return response.data.data!;
    },

    /**
     * Update quest with skills
     */
    async updateQuestWithSkills(id: number, questData: UpdateQuestRequest & { skillRequirements?: Array<{ skillId: number; minLevel: number }> }): Promise<Quest> {
        const response = await api.put<ApiResponse<Quest>>(`/api/quests/${id}/with-skills`, questData);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to update quest with skills');
        }

        return response.data.data!;
    },

    /**
     * Delete quest
     */
    async deleteQuest(id: number): Promise<void> {
        const response = await api.delete<ApiResponse>(`/api/quests/${id}`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to delete quest');
        }
    },

    /**
     * Claim a quest
     */
    async claimQuest(id: number): Promise<Quest> {
        const response = await api.post<ApiResponse<Quest>>(`/api/quests/${id}/claim`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to claim quest');
        }

        return response.data.data!;
    },

    /**
     * Complete a quest
     */
    async completeQuest(id: number): Promise<Quest> {
        const response = await api.post<ApiResponse<Quest>>(`/api/quests/${id}/complete`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to complete quest');
        }

        return response.data.data!;
    },

    /**
     * Approve a quest
     */
    async approveQuest(id: number): Promise<Quest> {
        const response = await api.put<ApiResponse<{ quest: Quest }>>(`/api/quests/${id}/approve`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to approve quest');
        }

        const quest = response.data.data?.quest;
        if (!quest) {
            throw new Error('No quest data returned from approve quest API');
        }
        return quest;
    },

    /**
     * Reject a quest
     */
    async rejectQuest(id: number, reason?: string): Promise<Quest> {
        const response = await api.put<ApiResponse<{ quest: Quest }>>(`/api/quests/${id}/reject`, { rejectionReason: reason });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to reject quest');
        }

        const quest = response.data.data?.quest;
        if (!quest) {
            throw new Error('No quest data returned from reject quest API');
        }
        return quest;
    },

    /**
     * Reset a repeatable quest from cooldown to available (admin only)
     */
    async resetRepeatableQuest(id: number): Promise<Quest> {
        const response = await api.put<ApiResponse<{ quest: Quest }>>(`/api/quests/${id}/reset`);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to reset quest');
        }

        const quest = response.data.data?.quest;
        if (!quest) {
            throw new Error('No quest data returned from reset quest API');
        }
        return quest;
    },

    /**
     * Get quests created by current user
     */
    async getMyCreatedQuests(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<QuestListingResponse> {
        const response = await api.get<ApiResponse<QuestListingResponse>>('/api/quests/my-created', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch created quests');
        }

        return response.data.data!;
    },

    /**
     * Get quests claimed by current user
     */
    async getMyClaimedQuests(params?: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<QuestListingResponse> {
        const response = await api.get<ApiResponse<QuestListingResponse>>('/api/quests/my-claimed', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch claimed quests');
        }

        return response.data.data!;
    },

    /**
     * Get user's completion history (including repeatable quests that have been reset)
     */
    async getMyCompletionHistory(params?: {
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<QuestListingResponse> {
        const response = await api.get<ApiResponse<QuestListingResponse>>('/api/quests/my-completion-history', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch completion history');
        }

        return response.data.data!;
    },

    /**
     * Get repeatable quests
     */
    async getRepeatableQuests(params?: {
        page?: number;
        limit?: number;
    }): Promise<QuestListingResponse> {
        const response = await api.get<ApiResponse<QuestListingResponse>>('/api/quests/repeatable', { params });

        if (!response.data.success) {
            throw new Error(response.data.error?.message || 'Failed to fetch repeatable quests');
        }

        return response.data.data!;
    },
};
