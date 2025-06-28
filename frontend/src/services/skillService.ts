import {
    Skill,
    UserSkill,
    QuestRequiredSkill,
    CreateSkillRequest,
    UpdateSkillRequest,
    UpdateUserSkillRequest,
    CreateQuestRequiredSkillRequest,
    UpdateQuestRequiredSkillRequest,
    SkillsResponse,
    UserSkillsResponse,
    ApiResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class SkillService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Skill management (Admin/Editor only)
    async getSkills(page = 1, limit = 10): Promise<SkillsResponse> {
        return this.request<SkillsResponse>(`/api/skills?page=${page}&limit=${limit}`);
    }

    async getSkill(id: number): Promise<Skill> {
        const response = await this.request<ApiResponse<Skill>>(`/api/skills/${id}`);
        return response.data!;
    }

    async createSkill(data: CreateSkillRequest): Promise<Skill> {
        const response = await this.request<ApiResponse<Skill>>('/api/skills', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data!;
    }

    async updateSkill(id: number, data: UpdateSkillRequest): Promise<Skill> {
        const response = await this.request<ApiResponse<Skill>>(`/api/skills/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data!;
    }

    async deleteSkill(id: number): Promise<void> {
        await this.request(`/api/skills/${id}`, {
            method: 'DELETE',
        });
    }

    // User skill management
    async getUserSkills(userId: number, page = 1, limit = 10): Promise<UserSkillsResponse> {
        const response = await this.request<ApiResponse<UserSkillsResponse>>(`/api/skills/user/${userId}?page=${page}&limit=${limit}`);
        return response.data!;
    }

    async getMySkills(): Promise<UserSkill[]> {
        const response = await this.request<ApiResponse<UserSkill[]>>('/api/skills/my-skills');
        return response.data!;
    }

    async updateUserSkill(userId: number, skillId: number, data: UpdateUserSkillRequest): Promise<UserSkill> {
        const requestBody = { skillId, ...data };

        const response = await this.request<ApiResponse<UserSkill>>(`/api/skills/user/${userId}`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
        return response.data!;
    }

    async deleteUserSkill(userId: number, skillId: number): Promise<void> {
        await this.request(`/api/skills/user/${userId}/${skillId}`, {
            method: 'DELETE',
        });
    }

    // Quest required skills management
    async getQuestRequiredSkills(questId: number): Promise<QuestRequiredSkill[]> {
        const response = await this.request<ApiResponse<QuestRequiredSkill[]>>(`/api/quests/${questId}/required-skills`);
        return response.data!;
    }

    async getQuestSkillRequirements(questId: number): Promise<QuestRequiredSkill[]> {
        const response = await this.request<ApiResponse<QuestRequiredSkill[]>>(`/api/quests/${questId}/skill-requirements`);
        return response.data!;
    }

    async addQuestRequiredSkill(questId: number, data: CreateQuestRequiredSkillRequest): Promise<QuestRequiredSkill> {
        const response = await this.request<ApiResponse<QuestRequiredSkill>>(`/api/quests/${questId}/required-skills`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data!;
    }

    async updateQuestRequiredSkill(questId: number, skillId: number, data: UpdateQuestRequiredSkillRequest): Promise<QuestRequiredSkill> {
        const response = await this.request<ApiResponse<QuestRequiredSkill>>(`/api/quests/${questId}/required-skills/${skillId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data!;
    }

    async removeQuestRequiredSkill(questId: number, skillId: number): Promise<void> {
        await this.request(`/api/quests/${questId}/required-skills/${skillId}`, {
            method: 'DELETE',
        });
    }

    // Utility methods
    async getAllSkills(): Promise<Skill[]> {
        const response = await this.request<ApiResponse<Skill[]>>('/api/skills/available');
        return response.data!;
    }

    async getUserSkillLevel(userId: number, skillId: number): Promise<number> {
        try {
            const response = await this.request<ApiResponse<{ level: number }>>(`/api/skills/user/${userId}/${skillId}/level`);
            return response.data!.level;
        } catch (error) {
            console.error('Failed to get user skill level:', error);
            return 0; // Return 0 if user doesn't have this skill or if there's an error
        }
    }

    async getMySkillLevel(skillId: number): Promise<number> {
        try {
            const response = await this.request<ApiResponse<{ level: number }>>(`/api/skills/my-skill/${skillId}/level`);
            return response.data!.level;
        } catch (error) {
            console.error('Failed to get my skill level:', error);
            return 0; // Return 0 if user doesn't have this skill or if there's an error
        }
    }

    async checkQuestEligibility(userId: number, questId: number): Promise<{ eligible: boolean; missingSkills: string[] }> {
        const response = await this.request<ApiResponse<{ eligible: boolean; missingSkills: string[] }>>(`/api/quests/${questId}/check-eligibility/${userId}`);
        return response.data!;
    }
}

export const skillService = new SkillService();
