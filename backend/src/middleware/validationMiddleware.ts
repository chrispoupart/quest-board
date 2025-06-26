import { Request, Response, NextFunction } from 'express';
import { UpdateUserRequest } from '../types';
import { validateUserRole } from '../utils/validation';

/**
 * Validate user update request
 */
export const validateUserUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const updateData: UpdateUserRequest = req.body;
    const errors: string[] = [];

    // Validate name
    if (updateData.name !== undefined) {
        if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
            errors.push('Name must be a non-empty string');
        } else if (updateData.name.trim().length > 100) {
            errors.push('Name must be less than 100 characters');
        }
    }

    // Validate email
    if (updateData.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof updateData.email !== 'string' || !emailRegex.test(updateData.email)) {
            errors.push('Email must be a valid email address');
        }
    }

    // Validate role
    if (updateData.role !== undefined) {
        try {
            validateUserRole(updateData.role);
        } catch (error) {
            errors.push('Invalid role');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                details: errors
            }
        });
        return;
    }

    next();
};

/**
 * Validate user ID parameter
 */
export const validateUserId = (req: Request, res: Response, next: NextFunction): void => {
    const userIdParam = req.params['id'];

    if (!userIdParam) {
        res.status(400).json({
            success: false,
            error: { message: 'User ID is required' }
        });
        return;
    }

    const userId = parseInt(userIdParam);

    if (isNaN(userId) || userId <= 0) {
        res.status(400).json({
            success: false,
            error: { message: 'Invalid user ID' }
        });
        return;
    }

    next();
};

/**
 * Validate role update request
 */
export const validateRoleUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const { role } = req.body;
    const errors: string[] = [];

    if (!role) {
        errors.push('Role is required');
    } else {
        try {
            validateUserRole(role);
        } catch (error) {
            errors.push('Invalid role');
        }
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                details: errors
            }
        });
        return;
    }

    next();
};

/**
 * Generic validation for required fields
 */
export const validateRequiredFields = (requiredFields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const errors: string[] = [];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                errors.push(`${field} is required`);
            }
        }

        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    details: errors
                }
            });
            return;
        }

        next();
    };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction): void => {
    const pageParam = req.query['page'] as string;
    const limitParam = req.query['limit'] as string;

    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 10;

    const errors: string[] = [];

    if (page < 1) {
        errors.push('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
        errors.push('Limit must be between 1 and 100');
    }

    if (errors.length > 0) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                details: errors
            }
        });
        return;
    }

    // Add validated pagination to request
    (req as any).pagination = { page, limit };
    next();
};
