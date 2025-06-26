import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class DashboardController {
    /**
     * Get user dashboard data
     */
    static async getUserDashboard(req: Request, res: Response): Promise<void> {
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

            // Get user's current quests
            const currentQuestsList = await prisma.quest.findMany({
                where: {
                    claimedBy: userId,
                    status: { in: ['CLAIMED', 'COMPLETED'] }
                },
                orderBy: {
                    claimedAt: 'desc'
                },
                take: 5
            });

            // Get recent quests created by user
            const recentCreatedQuests = await prisma.quest.findMany({
                where: {
                    createdBy: userId
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5
            });

            res.json({
                success: true,
                data: {
                    stats: {
                        totalQuests,
                        completedQuests,
                        currentQuests,
                        totalBounty: totalBounty._sum.bounty || 0
                    },
                    currentQuests: currentQuestsList,
                    recentCreatedQuests
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting user dashboard:', error);
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

            // Get comprehensive user statistics
            const [totalQuests, completedQuests, currentQuests, totalBounty, pendingApproval] = await Promise.all([
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
                }),
                // Quests pending approval
                prisma.quest.count({
                    where: {
                        claimedBy: userId,
                        status: 'COMPLETED'
                    }
                })
            ]);

            res.json({
                success: true,
                data: {
                    totalQuests,
                    completedQuests,
                    currentQuests,
                    pendingApproval,
                    totalBounty: totalBounty._sum.bounty || 0,
                    averageBounty: completedQuests > 0 ? (totalBounty._sum.bounty || 0) / completedQuests : 0
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

    /**
     * Get quest listing with filters
     */
    static async getQuestListing(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const { status, page = 1, limit = 10, search } = req.query;
            const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

            // Build where clause
            const whereClause: any = {};

            // Filter by status
            if (status && status !== 'all') {
                whereClause.status = status;
            }

            // Search functionality
            if (search && typeof search === 'string') {
                whereClause.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            // Get quests with pagination
            const [quests, totalCount] = await Promise.all([
                prisma.quest.findMany({
                    where: whereClause,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: parseInt(limit as string),
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }),
                prisma.quest.count({ where: whereClause })
            ]);

            res.json({
                success: true,
                data: {
                    quests,
                    pagination: {
                        page: parseInt(page as string),
                        limit: parseInt(limit as string),
                        total: totalCount,
                        totalPages: Math.ceil(totalCount / parseInt(limit as string))
                    }
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting quest listing:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get admin dashboard data (admin only)
     */
    static async getAdminDashboard(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            // Get comprehensive admin statistics
            const [
                totalQuests,
                availableQuests,
                claimedQuests,
                completedQuests,
                approvedQuests,
                totalUsers,
                totalBountyAwarded
            ] = await Promise.all([
                // Total quests
                prisma.quest.count(),
                // Available quests
                prisma.quest.count({ where: { status: 'AVAILABLE' } }),
                // Claimed quests
                prisma.quest.count({ where: { status: 'CLAIMED' } }),
                // Completed quests
                prisma.quest.count({ where: { status: 'COMPLETED' } }),
                // Approved quests
                prisma.quest.count({ where: { status: 'APPROVED' } }),
                // Total users
                prisma.user.count(),
                // Total bounty awarded
                prisma.quest.aggregate({
                    where: { status: 'APPROVED' },
                    _sum: { bounty: true }
                })
            ]);

            // Get recent quests
            const recentQuests = await prisma.quest.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    claimer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            // Get quests pending approval
            const pendingApproval = await prisma.quest.findMany({
                where: { status: 'COMPLETED' },
                orderBy: { completedAt: 'desc' },
                take: 10,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    claimer: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                data: {
                    stats: {
                        totalQuests,
                        availableQuests,
                        claimedQuests,
                        completedQuests,
                        approvedQuests,
                        totalUsers,
                        totalBountyAwarded: totalBountyAwarded._sum.bounty || 0
                    },
                    recentQuests,
                    pendingApproval
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting admin dashboard:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }
}
