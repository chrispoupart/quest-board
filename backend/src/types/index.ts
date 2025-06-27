// Type definitions for the Quest Board application

export type UserRole = 'ADMIN' | 'EDITOR' | 'PLAYER';

export type QuestStatus = 'AVAILABLE' | 'CLAIMED' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'COOLDOWN';

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
    // Character customization fields
    characterName?: string;
    avatarUrl?: string;
    characterClass?: string;
    characterBio?: string;
    preferredPronouns?: string;
    favoriteColor?: string;
    experience: number;
    // Skills
    userSkills?: UserSkill[];
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
    // Character customization fields
    characterName?: string;
    avatarUrl?: string;
    characterClass?: string;
    characterBio?: string;
    preferredPronouns?: string;
    favoriteColor?: string;
    experience?: number;
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
    isRepeatable: boolean;
    cooldownDays?: number;
    lastCompletedAt?: Date;
    // Required skills
    requiredSkills?: QuestRequiredSkill[];
}

export interface CreateQuestRequest {
    title: string;
    description?: string;
    bounty: number;
    isRepeatable?: boolean;
    cooldownDays?: number;
    requiredSkills?: CreateQuestRequiredSkillRequest[];
}

export interface UpdateQuestRequest {
    title?: string;
    description?: string;
    bounty?: number;
    status?: QuestStatus;
    isRepeatable?: boolean;
    cooldownDays?: number;
    requiredSkills?: CreateQuestRequiredSkillRequest[];
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
    bountyBalance: number;
    createdAt: Date;
    updatedAt: Date;
    // Character customization fields
    characterName?: string | undefined;
    avatarUrl?: string | undefined;
    characterClass?: string | undefined;
    characterBio?: string | undefined;
    preferredPronouns?: string | undefined;
    favoriteColor?: string | undefined;
    experience: number;
    level: number;
    // Skills
    userSkills?: UserSkill[];
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

// Store types
export interface StoreItem {
    id: number;
    name: string;
    description?: string;
    cost: number;
    isActive: boolean;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
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
    createdAt: Date;
    updatedAt: Date;
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

// Skills types
export interface Skill {
    id: number;
    name: string;
    description?: string;
    isActive: boolean;
    createdBy: number;
    createdAt: Date;
    updatedAt: Date;
    creator?: User;
}

export interface CreateSkillRequest {
    name: string;
    description?: string;
}

export interface UpdateSkillRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface UserSkill {
    id: number;
    userId: number;
    skillId: number;
    level: number; // 1-5
    createdAt: Date;
    updatedAt: Date;
    skill?: Skill;
    user?: User;
}

export interface CreateUserSkillRequest {
    skillId: number;
    level: number;
}

export interface UpdateUserSkillRequest {
    level: number;
}

export interface QuestRequiredSkill {
    id: number;
    questId: number;
    skillId: number;
    minLevel: number;
    createdAt: Date;
    skill?: Skill;
}

export interface CreateQuestRequiredSkillRequest {
    skillId: number;
    minLevel: number;
}
