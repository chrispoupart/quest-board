import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';

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

/**
 * Middleware to verify JWT token and attach user info to request
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({
            success: false,
            error: { message: 'Access token required' }
        });
        return;
    }

    try {
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const decoded = jwt.verify(token, secret) as {
            userId: number;
            email: string;
            role: UserRole;
            iat: number;
            exp: number;
        };

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        // Only log in non-test environments to reduce noise during testing
        if (process.env['NODE_ENV'] !== 'test') {
            console.error('Token verification failed:', error);
        }
        res.status(403).json({
            success: false,
            error: { message: 'Invalid or expired token' }
        });
    }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (requiredRoles: UserRole | UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: { message: 'Authentication required' }
            });
            return;
        }

        const userRole = req.user.role;
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        if (!roles.includes(userRole)) {
            res.status(403).json({
                success: false,
                error: {
                    message: `Access denied. Required role(s): ${roles.join(', ')}. Current role: ${userRole}`
                }
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = requireRole('ADMIN');

/**
 * Middleware to check if user is admin or editor
 */
export const requireAdminOrEditor = requireRole(['ADMIN', 'EDITOR']);

/**
 * Middleware to check if user is authenticated (any role)
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: { message: 'Authentication required' }
        });
        return;
    }
    next();
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        next();
        return;
    }

    try {
        const secret = process.env['JWT_SECRET'];
        if (!secret) {
            next();
            return;
        }

        const decoded = jwt.verify(token, secret) as {
            userId: number;
            email: string;
            role: UserRole;
            iat: number;
            exp: number;
        };

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        // Token is invalid, but we don't fail the request
        console.warn('Invalid token in optional auth:', error);
        next();
    }
};
