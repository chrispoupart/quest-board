import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserRole, UpdateUserRequest, ApiResponse, AuthUser } from '../types';
import { validateUserRole } from '../utils/validation';

const prisma = new PrismaClient();

export class UserController {
    /**
     * Get current user profile
     */
    static async getCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            // Get user ID from JWT token (set by auth middleware)
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    googleId: true,
                    name: true,
                    email: true,
                    role: true,
                    bountyBalance: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: { message: 'User not found' }
                } as ApiResponse);
                return;
            }

            res.json({
                success: true,
                data: {
                    id: user.id,
                    googleId: user.googleId,
                    name: user.name,
                    email: user.email,
                    role: user.role as UserRole,
                    bountyBalance: user.bountyBalance,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            } as ApiResponse<AuthUser>);
        } catch (error) {
            console.error('Error getting current user:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Update current user profile
     */
    static async updateCurrentUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const updateData: UpdateUserRequest = req.body;

            // Validate role if provided
            if (updateData.role) {
                try {
                    validateUserRole(updateData.role);
                } catch (error) {
                    res.status(400).json({
                        success: false,
                        error: { message: 'Invalid role' }
                    } as ApiResponse);
                    return;
                }
            }

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    error: { message: 'User not found' }
                } as ApiResponse);
                return;
            }

            // Build update data object, only including defined values
            const updateFields: any = {};
            if (updateData.name !== undefined) updateFields.name = updateData.name;
            if (updateData.email !== undefined) updateFields.email = updateData.email;
            if (updateData.role !== undefined) updateFields.role = updateData.role;

            // Update user
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateFields,
                select: {
                    id: true,
                    googleId: true,
                    name: true,
                    email: true,
                    role: true,
                    bountyBalance: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            res.json({
                success: true,
                data: {
                    id: updatedUser.id,
                    googleId: updatedUser.googleId,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role as UserRole,
                    bountyBalance: updatedUser.bountyBalance,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                }
            } as ApiResponse<AuthUser>);
        } catch (error) {
            console.error('Error updating current user:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get all users (admin only)
     */
    static async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    googleId: true,
                    name: true,
                    email: true,
                    role: true,
                    bountyBalance: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            const formattedUsers: AuthUser[] = users.map(user => ({
                id: user.id,
                googleId: user.googleId,
                name: user.name,
                email: user.email,
                role: user.role as UserRole,
            }));

            res.json({
                success: true,
                data: formattedUsers
            } as ApiResponse<AuthUser[]>);
        } catch (error) {
            console.error('Error getting all users:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get user by ID (admin only)
     */
    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const userIdParam = req.params['id'];
            if (!userIdParam) {
                res.status(400).json({
                    success: false,
                    error: { message: 'User ID is required' }
                } as ApiResponse);
                return;
            }

            const userId = parseInt(userIdParam);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid user ID' }
                } as ApiResponse);
                return;
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    googleId: true,
                    name: true,
                    email: true,
                    role: true,
                    bountyBalance: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: { message: 'User not found' }
                } as ApiResponse);
                return;
            }

            res.json({
                success: true,
                data: {
                    id: user.id,
                    googleId: user.googleId,
                    name: user.name,
                    email: user.email,
                    role: user.role as UserRole,
                    bountyBalance: user.bountyBalance,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                }
            } as ApiResponse<AuthUser>);
        } catch (error) {
            console.error('Error getting user by ID:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Update user role (admin only)
     */
    static async updateUserRole(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const userIdParam = req.params['id'];
            if (!userIdParam) {
                res.status(400).json({
                    success: false,
                    error: { message: 'User ID is required' }
                } as ApiResponse);
                return;
            }

            const userId = parseInt(userIdParam);

            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid user ID' }
                } as ApiResponse);
                return;
            }

            const { role } = req.body;

            if (!role) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Role is required' }
                } as ApiResponse);
                return;
            }

            // Validate role
            try {
                validateUserRole(role);
            } catch (error) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid role' }
                } as ApiResponse);
                return;
            }

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!existingUser) {
                res.status(404).json({
                    success: false,
                    error: { message: 'User not found' }
                } as ApiResponse);
                return;
            }

            // Update user role
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { role },
                select: {
                    id: true,
                    googleId: true,
                    name: true,
                    email: true,
                    role: true,
                    bountyBalance: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            res.json({
                success: true,
                data: {
                    id: updatedUser.id,
                    googleId: updatedUser.googleId,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role as UserRole,
                    bountyBalance: updatedUser.bountyBalance,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                }
            } as ApiResponse<AuthUser>);
        } catch (error) {
            console.error('Error updating user role:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get user statistics
     */
    static async getUserStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            // Get user's quest statistics
            const [totalQuests, completedQuests, currentQuests, totalBounty] = await Promise.all([
                // Total quests created by user
                prisma.quest.count({
                    where: { createdBy: userId }
                }),
                // Completed quests by user
                prisma.quest.count({
                    where: {
                        claimedBy: userId,
                        status: 'APPROVED'
                    }
                }),
                // Current claimed quests
                prisma.quest.count({
                    where: {
                        claimedBy: userId,
                        status: { in: ['CLAIMED', 'COMPLETED'] }
                    }
                }),
                // Total bounty earned
                prisma.quest.aggregate({
                    where: {
                        claimedBy: userId,
                        status: 'APPROVED'
                    },
                    _sum: {
                        bounty: true
                    }
                })
            ]);

            res.json({
                success: true,
                data: {
                    totalQuests,
                    completedQuests,
                    currentQuests,
                    totalBounty: totalBounty._sum.bounty || 0
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting user stats:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }
}
