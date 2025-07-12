import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { prisma } from '../db';

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
            const completions = await prisma.questCompletion.findMany({
                where: {
                    userId: userId,
                    status: 'APPROVED'
                },
                include: {
                    quest: {
                        select: {
                            bounty: true
                        }
                    }
                }
            });

            const completedQuests = completions.length;
            const totalBounty = completions.reduce((sum, c) => sum + c.quest.bounty, 0);

            const [totalQuests, currentQuests] = await Promise.all([
                // Total quests created by user
                prisma.quest.count({
                    where: { createdBy: userId }
                }),
                // Current claimed quests
                prisma.quest.count({
                    where: {
                        claimedBy: userId,
                        status: { in: ['CLAIMED', 'PENDING_APPROVAL'] }
                    }
                }),
            ]);

            // Get user's current quests
            const currentQuestsList = await prisma.quest.findMany({
                where: {
                    claimedBy: userId,
                    status: { in: ['CLAIMED', 'PENDING_APPROVAL'] }
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
                        totalBounty
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
            const completions = await prisma.questCompletion.findMany({
                where: {
                    userId: userId,
                    status: 'APPROVED'
                },
                include: {
                    quest: {
                        select: {
                            bounty: true
                        }
                    }
                }
            });

            const completedQuests = completions.length;
            const earnedBounty = completions.reduce((sum, c) => sum + c.quest.bounty, 0);

            const [user, totalQuests, currentQuests, pendingApproval] = await Promise.all([
                // Get user's bounty balance
                prisma.user.findUnique({
                    where: { id: userId },
                    select: { bountyBalance: true }
                }),
                // Total quests created by user
                prisma.quest.count({
                    where: { createdBy: userId }
                }),
                // Current claimed quests
                prisma.quest.count({
                    where: {
                        claimedBy: userId,
                        status: { in: ['CLAIMED', 'PENDING_APPROVAL'] }
                    }
                }),
                // Quests pending approval
                prisma.quest.count({
                    where: {
                        claimedBy: userId,
                        status: 'PENDING_APPROVAL'
                    }
                })
            ]);

            res.json({
                success: true,
                data: {
                    stats: {
                        questsCreated: totalQuests,
                        completedQuests,
                        activeQuests: currentQuests,
                        pendingApproval,
                        totalBounty: earnedBounty,
                        averageBounty: completedQuests > 0 ? earnedBounty / completedQuests : 0
                    }
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
            const userRole = (req as any).user?.role;
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
            const whereConditions: any[] = [];

            // Filter by status
            if (status && status !== 'all') {
                whereConditions.push({ status: status });
            }

            // Search functionality
            if (search && typeof search === 'string') {
                whereConditions.push({
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                });
            }

            // Filter quests based on user role and assignment
            if (userRole !== 'ADMIN') {
                whereConditions.push({
                    OR: [{ userId: null }, { userId: userId }],
                });
            }

            // Exclude expired quests (dueDate in the past)
            whereConditions.push({
                OR: [
                    { dueDate: null },
                    { dueDate: { gte: new Date() } }
                ]
            });

            const whereClause = whereConditions.length > 0 ? { AND: whereConditions } : {};

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
                                email: true,
                                role: true,
                                characterName: true,
                                avatarUrl: true,
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                characterName: true,
                                avatarUrl: true,
                            }
                        },
                        personalizedFor: { // Assigned user
                            select: {
                                id: true,
                                name: true,
                                characterName: true,
                                avatarUrl: true,
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
                            email: true,
                            role: true,
                            characterName: true,
                            avatarUrl: true,
                        }
                    },
                    claimer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            characterName: true,
                            avatarUrl: true,
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
                            email: true,
                            role: true,
                            characterName: true,
                            avatarUrl: true,
                        }
                    },
                    claimer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            characterName: true,
                            avatarUrl: true,
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

    /**
     * Get recent activity for the current user
     */
    static async getRecentActivity(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const userRole = (req as any).user?.role;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            let quests;

            // For quest creators (EDITOR/ADMIN), show quests they created
            // For players, show quests they have claimed/completed
            if (userRole === 'EDITOR' || userRole === 'ADMIN') {
                quests = await prisma.quest.findMany({
                    where: {
                        createdBy: userId
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                characterName: true,
                                avatarUrl: true,
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                characterName: true,
                                avatarUrl: true,
                            }
                        }
                    }
                });
            } else {
                // For players, show quests they have interacted with
                quests = await prisma.quest.findMany({
                    where: {
                        claimedBy: userId
                    },
                    orderBy: {
                        claimedAt: 'desc'
                    },
                    take: 10,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                characterName: true,
                                avatarUrl: true,
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                characterName: true,
                                avatarUrl: true,
                            }
                        }
                    }
                });
            }

            res.json({
                success: true,
                data: {
                    quests
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting recent activity:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get user's active quests (claimed/completed quests)
     */
    static async getActiveQuests(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            // Get user's active quests (claimed or completed)
            const quests = await prisma.quest.findMany({
                where: {
                    claimedBy: userId,
                    status: { in: ['CLAIMED', 'COMPLETED'] }
                },
                orderBy: {
                    claimedAt: 'desc'
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            characterName: true,
                            avatarUrl: true,
                        }
                    },
                    claimer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            characterName: true,
                            avatarUrl: true,
                        }
                    }
                }
            });

            res.json({
                success: true,
                data: {
                    quests
                }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting active quests:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    static async getBountyLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const { month } = req.query;
            if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
                res.status(400).json({ error: 'Invalid or missing month parameter (expected YYYY-MM)' });
                return;
            }
            // Calculate start and end of the month
            const [year, mon] = month.split('-').map(Number);
            const start = new Date(year, mon - 1, 1);
            const end = new Date(year, mon, 1);

            // Find all approved quest completions in this month
            const completions = await prisma.questCompletion.findMany({
                where: {
                    completedAt: {
                        gte: start,
                        lt: end
                    },
                    status: 'APPROVED'
                },
                include: {
                    user: true,
                    quest: true
                }
            });

            // Aggregate bounty by userId
            const bountyByUser: Record<number, { name: string; bounty: number; userId: number }> = {};
            for (const c of completions) {
                if (!c.user || !c.quest) continue; // Skip if user or quest is missing

                const userId = c.userId;
                const userName = c.user.name;
                const bounty = c.quest.bounty;

                if (!bountyByUser[userId]) {
                    bountyByUser[userId] = { name: userName, bounty: 0, userId };
                }
                bountyByUser[userId].bounty += bounty;
            }

            // Convert to an array, sort by bounty, and take the top 5
            let leaderboard = Object.values(bountyByUser)
                .sort((a, b) => b.bounty - a.bounty || a.name.localeCompare(b.name));

            // If fewer than 5, fill with users with 0 bounty
            if (leaderboard.length < 5) {
                const excludeIds = leaderboard.map(u => u.userId);
                const fillUsers = await prisma.user.findMany({
                    where: excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {},
                    orderBy: { name: 'asc' },
                    take: 5 - leaderboard.length
                });

                leaderboard = leaderboard.concat(
                    fillUsers.map(u => ({ userId: u.id, name: u.name, bounty: 0 }))
                );
            }

            res.status(200).json(
                leaderboard.slice(0, 5).map(u => ({ name: u.name, bounty: u.bounty }))
            );
        } catch (error) {
            console.error('Error getting bounty leaderboard:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getQuestLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const { month } = req.query;
            if (!month || typeof month !== 'string' || !/^\d{4}-\d{2}$/.test(month)) {
                res.status(400).json({ error: 'Invalid or missing month parameter (expected YYYY-MM)' });
                return;
            }
            // Calculate start and end of the month
            const [year, mon] = month.split('-').map(Number);
            const start = new Date(year, mon - 1, 1);
            const end = new Date(year, mon, 1);

            // Find all approved quest completions in this month
            const completions = await prisma.questCompletion.findMany({
                where: {
                    completedAt: {
                        gte: start,
                        lt: end
                    },
                    status: 'APPROVED'
                },
                include: {
                    user: true
                }
            });

            // Count completions per user
            const completionsByUser: Record<number, { name: string; questsCompleted: number }> = {};
            for (const c of completions) {
                if (!c.user) continue;
                const userId = c.userId;
                const userName = c.user.name;
                if (!completionsByUser[userId]) {
                    completionsByUser[userId] = { name: userName, questsCompleted: 0 };
                }
                completionsByUser[userId].questsCompleted += 1;
            }

            // Get all users with completions for the month
            let leaderboard = Object.entries(completionsByUser).map(([userId, entry]) => ({
                userId: Number(userId),
                name: entry.name,
                questsCompleted: entry.questsCompleted
            }));
            // Sort by completions desc, then name asc
            leaderboard.sort((a, b) => b.questsCompleted - a.questsCompleted || a.name.localeCompare(b.name));

            // If fewer than 5, fill with users with 0 completions (excluding those already in leaderboard)
            if (leaderboard.length < 5) {
                const excludeIds = leaderboard.map(u => u.userId);
                const fillUsers = await prisma.user.findMany({
                    where: excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {},
                    orderBy: { name: 'asc' },
                    take: 5 - leaderboard.length
                });
                leaderboard = leaderboard.concat(
                    fillUsers.map(u => ({ userId: u.id, name: u.name, questsCompleted: 0 }))
                );
            }
            // Only return name and questsCompleted, and limit to 5
            res.status(200).json(
                leaderboard.slice(0, 5).map(u => ({ name: u.name, questsCompleted: u.questsCompleted }))
            );
        } catch (error) {
            console.error('Error getting quest leaderboard:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
