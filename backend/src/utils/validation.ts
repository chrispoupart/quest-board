import { UserRole, QuestStatus, ApprovalStatus } from '../types';

// Validation constants
export const VALID_USER_ROLES: UserRole[] = ['ADMIN', 'EDITOR', 'PLAYER'];
export const VALID_QUEST_STATUSES: QuestStatus[] = ['AVAILABLE', 'CLAIMED', 'COMPLETED', 'APPROVED', 'REJECTED'];
export const VALID_APPROVAL_STATUSES: ApprovalStatus[] = ['APPROVED', 'REJECTED'];

// Validation functions
export function isValidUserRole(role: string): role is UserRole {
    return VALID_USER_ROLES.includes(role as UserRole);
}

export function isValidQuestStatus(status: string): status is QuestStatus {
    return VALID_QUEST_STATUSES.includes(status as QuestStatus);
}

export function isValidApprovalStatus(status: string): status is ApprovalStatus {
    return VALID_APPROVAL_STATUSES.includes(status as ApprovalStatus);
}

// Validation helpers
export function validateUserRole(role: string): UserRole {
    if (!isValidUserRole(role)) {
        throw new Error(`Invalid user role: ${role}. Must be one of: ${VALID_USER_ROLES.join(', ')}`);
    }
    return role;
}

export function validateQuestStatus(status: string): QuestStatus {
    if (!isValidQuestStatus(status)) {
        throw new Error(`Invalid quest status: ${status}. Must be one of: ${VALID_QUEST_STATUSES.join(', ')}`);
    }
    return status;
}

export function validateApprovalStatus(status: string): ApprovalStatus {
    if (!isValidApprovalStatus(status)) {
        throw new Error(`Invalid approval status: ${status}. Must be one of: ${VALID_APPROVAL_STATUSES.join(', ')}`);
    }
    return status;
}

// Database query helpers
export function createRoleFilter(role: UserRole) {
    return { role };
}

export function createStatusFilter(status: QuestStatus) {
    return { status };
}

export function createApprovalStatusFilter(status: ApprovalStatus) {
    return { status };
}
