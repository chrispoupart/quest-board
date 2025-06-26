// Type definitions for the Quest Board application

export type UserRole = 'ADMIN' | 'EDITOR' | 'PLAYER';

export type QuestStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'APPROVED' | 'REJECTED';

export type ApprovalStatus = 'APPROVED' | 'REJECTED';

// User types
export interface User {
    id: number;
    googleId: string;
    name: string;
    email: string;
    role: UserRole;
    bountyBalance: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserRequest {
    googleId: string;
    name: string;
    email: string;
    role?: UserRole;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: UserRole;
}

// Quest types
export interface Quest {
    id: number;
    title: string;
    description?: string;
    bounty: number;
    status: QuestStatus;
    createdBy: number;
    claimedBy?: number;
    claimedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
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

// Approval types
export interface Approval {
    id: number;
    questId: number;
    approvedBy: number;
    status: ApprovalStatus;
    notes?: string;
    createdAt: Date;
}

export interface CreateApprovalRequest {
    questId: number;
    status: ApprovalStatus;
    notes?: string;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Dashboard types
export interface UserStats {
    totalQuests: number;
    completedQuests: number;
    totalBounty: number;
    currentQuests: number;
}

export interface DashboardData {
    user: User;
    stats: UserStats;
    recentQuests: Quest[];
}

// Authentication types
export interface AuthUser {
    id: number;
    googleId: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface JwtPayload {
    userId: number;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

// Google OAuth types
export interface GoogleUserInfo {
    id: string;
    email: string;
    name: string;
    picture?: string | undefined;
}

export interface GoogleAuthRequest {
    code: string;
    redirectUri: string;
}
