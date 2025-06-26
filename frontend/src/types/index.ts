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
    isRepeatable: boolean;
    cooldownDays?: number;
    lastCompletedAt?: string;
}

export type QuestStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'COOLDOWN';

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
    isRepeatable?: boolean;
    cooldownDays?: number;
}

export interface UpdateQuestRequest {
    title?: string;
    description?: string;
    bounty?: number;
    status?: QuestStatus;
    isRepeatable?: boolean;
    cooldownDays?: number;
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

// Store types
export interface StoreItem {
    id: number;
    name: string;
    description?: string;
    cost: number;
    isActive: boolean;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    creator?: User;
}

export interface CreateStoreItemRequest {
    name: string;
    description?: string;
    cost: number;
}

export interface UpdateStoreItemRequest {
    name?: string;
    description?: string;
    cost?: number;
    isActive?: boolean;
}

export interface StoreTransaction {
    id: number;
    itemId: number;
    buyerId: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    notes?: string;
    createdAt: string;
    updatedAt: string;
    item?: StoreItem;
    buyer?: User;
}

export interface CreateStoreTransactionRequest {
    itemId: number;
}

export interface UpdateStoreTransactionRequest {
    status: 'APPROVED' | 'REJECTED';
    notes?: string;
}

export interface StoreItemsResponse {
    items: StoreItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface StoreTransactionsResponse {
    transactions: StoreTransaction[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
