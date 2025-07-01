import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import config from '../config';

// Type guard function to ensure JWT secret is a string
function isJwtSecret(value: string | undefined): value is string {
    return typeof value === 'string' && value.length > 0;
}

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: UserRole;
            };
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: { message: 'Authentication required' }
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    // Ensure jwtSecret is defined before using it
    if (!isJwtSecret(config.jwtSecret)) {
        console.error('JWT Secret is not defined in the configuration.');
        res.status(500).json({
            success: false,
            error: { message: 'Server configuration error: JWT secret missing.' }
        });
        return;
    }

    try {
        // TypeScript now knows config.jwtSecret is a string due to the type guard
        const decoded = jwt.verify(token, config.jwtSecret);

        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            req.user = decoded as { userId: number; email: string; role: UserRole };
            next();
        } else {
            throw new Error('Invalid token payload');
        }
    } catch (error) {
        res.status(401).json({
            success: false,
            error: { message: 'Invalid or expired token' }
        });
    }
};

/**
 * Middleware to check for specific roles.
 * Usage: `app.get('/admin', authMiddleware, hasRole(['ADMIN']), ...)`
 */
export const hasRole = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user || !roles.includes(user.role)) {
            res.status(403).json({
                success: false,
                error: { message: `Access denied. Required roles: ${roles.join(', ')}` }
            });
            return;
        }
        next();
    };
};

/**
 * Middleware to check for admin role.
 * For admin-only routes.
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || user.role !== 'ADMIN') {
        res.status(403).json({
            success: false,
            error: { message: 'Access denied. Admin role required.' }
        });
        return;
    }
    next();
};

/**
 * Middleware to check for editor or admin role.
 * For routes that can be accessed by content creators and admins.
 */
export const isEditorOrAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || (user.role !== 'EDITOR' && user.role !== 'ADMIN')) {
        res.status(403).json({
            success: false,
            error: { message: 'Access denied. Editor or admin role required.' }
        });
        return;
    }
    next();
};

/**
 * Middleware to check if the authenticated user is the owner of a resource
 * or has a specific role (e.g., admin).
 *
 * This is a flexible middleware that requires you to provide a function
 * to retrieve the resource owner's ID.
 *
 * @param getOwnerId - An async function that takes the request object and returns the resource owner's ID.
 * @param allowedRoles - An optional array of roles that are always allowed access.
 */
export const isOwnerOrRole = (
    getOwnerId: (req: Request) => Promise<number | null | undefined>,
    allowedRoles: UserRole[] = []
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const user = req.user;

        if (!user) {
            res.status(401).json({
                success: false,
                error: { message: 'User not authenticated' }
            });
            return;
        }

        // Users with allowed roles can always proceed
        if (allowedRoles.includes(user.role)) {
            return next();
        }

        try {
            const ownerId = await getOwnerId(req);

            if (user.userId === ownerId) {
                return next(); // User is the owner
            }

            res.status(403).json({
                success: false,
                error: { message: 'Access denied. You are not the owner of this resource.' }
            });
            return;
        } catch (error) {
            console.error('Error in isOwnerOrRole middleware:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            });
            return;
        }
    };
};
