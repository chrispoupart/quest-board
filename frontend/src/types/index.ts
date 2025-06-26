export interface User {
    id: number;
    googleId: string;
    name: string;
    email: string;
    role: UserRole;
    bountyBalance?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type UserRole = 'ADMIN' | 'EDITOR' | 'PLAYER';

export interface Quest {
    id: number;
    title: string;
    description?: string;
    bounty: number;
    status: QuestStatus;
    createdBy: number;
    claimedBy?: number;
    claimedAt?: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    creator?: User;
    claimer?: User;
}

export type QuestStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'APPROVED' | 'REJECTED';

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        details?: string[];
    };
}

export interface LoginRequest {
    code: string;
    redirectUri: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: UserRole;
}

export interface CreateQuestRequest {
    title: string;
    description?: string;
    bounty: number;
}

export interface UpdateQuestRequest {
    title?: string;
    description?: string;
    bounty?: number;
    status?: QuestStatus;
}

export interface UserStats {
    totalQuests: number;
    completedQuests: number;
    currentQuests: number;
    pendingApproval: number;
    totalBounty: number;
    averageBounty: number;
}

export interface DashboardData {
    stats: {
        totalQuests: number;
        completedQuests: number;
        currentQuests: number;
        totalBounty: number;
    };
    currentQuests: Quest[];
    recentCreatedQuests: Quest[];
}

export interface QuestListingResponse {
    quests: Quest[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface AdminDashboardData {
    stats: {
        totalQuests: number;
        availableQuests: number;
        claimedQuests: number;
        completedQuests: number;
        approvedQuests: number;
        totalUsers: number;
        totalBountyAwarded: number;
    };
    recentQuests: Quest[];
    pendingApproval: Quest[];
}
