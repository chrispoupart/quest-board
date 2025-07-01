import { Request, Response } from 'express';
import { ApiResponse, UserRole } from '../types';
import { calculateQuestExperience, checkLevelUp, getLevelInfo } from '../utils/leveling';
import { prisma } from '../db';

export class QuestController {
    /**
     * List all quests
     */
    static async getAllQuests(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const status = req.query['status'] as string;
            const search = req.query['search'] as string;
            const skip = (page - 1) * limit;

            const where: any = {};
            if (status) {
                if (status.includes(',')) {
                    where.status = { in: status.split(',') };
                } else {
                    where.status = status;
                }
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [quests, total] = await Promise.all([
                prisma.quest.findMany({
                    where,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.quest.count({ where })
            ]);

            const response = {
                quests,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting quests:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get quest by ID
     */
    static async getQuestById(req: Request, res: Response): Promise<void> {
        try {
            const questIdParam = req.params['id'];
            if (!questIdParam) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }
            const questId = parseInt(questIdParam);
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }
            const quest = await prisma.quest.findUnique({ where: { id: questId } });
            if (!quest) {
                res.status(404).json({ success: false, error: { message: 'Quest not found' } });
                return;
            }
            res.json({ success: true, data: quest } as ApiResponse);
        } catch (error) {
            console.error('Error getting quest by ID:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Create a new quest (admin/editor only)
     */
    static async createQuest(req: Request, res: Response): Promise<void> {
        try {
            const { title, description, bounty, isRepeatable, cooldownDays } = req.body;
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }
            if (!title || typeof title !== 'string' || title.trim().length === 0) {
                res.status(400).json({ success: false, error: { message: 'Title is required' } });
                return;
            }
            if (typeof bounty !== 'number' || bounty <= 0) {
                res.status(400).json({ success: false, error: { message: 'Bounty must be a positive number' } });
                return;
            }
            if (isRepeatable && (typeof cooldownDays !== 'number' || cooldownDays <= 0)) {
                res.status(400).json({ success: false, error: { message: 'Cooldown days must be a positive number for repeatable quests' } });
                return;
            }
            const quest = await prisma.quest.create({
                data: {
                    title,
                    description,
                    bounty,
                    status: 'AVAILABLE',
                    createdBy: userId,
                    isRepeatable: isRepeatable || false,
                    cooldownDays: isRepeatable ? cooldownDays : null,
                },
            });
            res.status(201).json({ success: true, data: { quest } } as any);
        } catch (error) {
            console.error('Error creating quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Update a quest (admin/editor only)
     */
    static async updateQuest(req: Request, res: Response): Promise<void> {
        try {
            const questIdParam = req.params['id'];
            if (!questIdParam) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }
            const questId = parseInt(questIdParam);
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }
            const { title, description, bounty, status, isRepeatable, cooldownDays } = req.body;
            const updateFields: any = {};
            if (title !== undefined) updateFields.title = title;
            if (description !== undefined) updateFields.description = description;
            if (bounty !== undefined) updateFields.bounty = bounty;
            if (status !== undefined) updateFields.status = status;
            if (isRepeatable !== undefined) updateFields.isRepeatable = isRepeatable;
            if (cooldownDays !== undefined) {
                if (isRepeatable && (typeof cooldownDays !== 'number' || cooldownDays <= 0)) {
                    res.status(400).json({ success: false, error: { message: 'Cooldown days must be a positive number for repeatable quests' } });
                    return;
                }
                updateFields.cooldownDays = isRepeatable ? cooldownDays : null;
            }
            const quest = await prisma.quest.update({
                where: { id: questId },
                data: updateFields,
            });
            res.json({ success: true, data: quest } as ApiResponse);
        } catch (error) {
            console.error('Error updating quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Delete a quest (admin only)
     */
    static async deleteQuest(req: Request, res: Response): Promise<void> {
        try {
            const questIdParam = req.params['id'];
            if (!questIdParam) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }
            const questId = parseInt(questIdParam);
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }
            await prisma.quest.delete({ where: { id: questId } });
            res.json({ success: true, message: 'Quest deleted successfully' } as ApiResponse);
        } catch (error) {
            console.error('Error deleting quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Claim a quest
     */
    static async claimQuest(req: Request, res: Response): Promise<void> {
        try {
            const questIdParam = req.params['id'];
            if (!questIdParam) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }
            const questId = parseInt(questIdParam);
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            // Get quest with skill requirements
            const quest = await prisma.quest.findUnique({
                where: { id: questId },
                include: {
                    requiredSkills: {
                        include: {
                            skill: {
                                select: {
                                    id: true,
                                    name: true,
                                }
                            }
                        }
                    }
                }
            });

            if (!quest) {
                res.status(404).json({ success: false, error: { message: 'Quest not found' } });
                return;
            }

            if (quest.status !== 'AVAILABLE') {
                let errorMessage = 'Quest is not available for claiming';
                if (quest.status === 'CLAIMED') {
                    errorMessage = 'Quest is already claimed';
                } else if (quest.status === 'COMPLETED') {
                    errorMessage = 'Quest is already completed';
                } else if (quest.status === 'APPROVED') {
                    errorMessage = 'Quest is already approved';
                }
                res.status(400).json({ success: false, error: { message: errorMessage } });
                return;
            }

            // Validate skill requirements if the quest has any
            if (quest.requiredSkills.length > 0) {
                // Get user's skills
                const userSkills = await prisma.userSkill.findMany({
                    where: { userId },
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                });

                // Check each required skill
                const missingSkills: string[] = [];
                const insufficientSkills: string[] = [];

                for (const requirement of quest.requiredSkills) {
                    const userSkill = userSkills.find(us => us.skillId === requirement.skillId);

                    if (!userSkill) {
                        // User doesn't have this skill at all
                        missingSkills.push(requirement.skill.name);
                    } else if (userSkill.level < requirement.minLevel) {
                        // User has the skill but level is too low
                        insufficientSkills.push(`${requirement.skill.name} (required: ${requirement.minLevel}, current: ${userSkill.level})`);
                    }
                }

                // If user doesn't meet requirements, return error
                if (missingSkills.length > 0 || insufficientSkills.length > 0) {
                    let errorMessage = 'You do not meet the skill requirements for this quest:';

                    if (missingSkills.length > 0) {
                        errorMessage += `\nMissing skills: ${missingSkills.join(', ')}`;
                    }

                    if (insufficientSkills.length > 0) {
                        errorMessage += `\nInsufficient skill levels: ${insufficientSkills.join(', ')}`;
                    }

                    res.status(403).json({
                        success: false,
                        error: {
                            message: errorMessage,
                            missingSkills,
                            insufficientSkills
                        }
                    });
                    return;
                }
            }

            const updatedQuest = await prisma.quest.update({
                where: { id: questId },
                data: {
                    status: 'CLAIMED',
                    claimedBy: userId,
                    claimedAt: new Date(),
                },
            });
            res.json({ success: true, data: { quest: updatedQuest } } as any);
        } catch (error) {
            console.error('Error claiming quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Complete a quest
     */
    static async completeQuest(req: Request, res: Response): Promise<void> {
        try {
            const questIdParam = req.params['id'];
            if (!questIdParam) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }
            const questId = parseInt(questIdParam);
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }
            const quest = await prisma.quest.findUnique({ where: { id: questId } });
            if (!quest) {
                res.status(404).json({ success: false, error: { message: 'Quest not found' } });
                return;
            }
            if (quest.status !== 'CLAIMED') {
                res.status(400).json({ success: false, error: { message: 'Quest is not claimed' } });
                return;
            }
            if (quest.claimedBy !== userId) {
                res.status(403).json({ success: false, error: { message: 'Quest is not claimed by you' } });
                return;
            }
            const updatedQuest = await prisma.quest.update({
                where: { id: questId },
                data: {
                    status: 'PENDING_APPROVAL',
                    completedAt: new Date(),
                },
            });
            res.json({ success: true, data: { quest: updatedQuest } } as any);
        } catch (error) {
            console.error('Error completing quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Approve quest completion (admin/editor only)
     */
    static async approveQuest(req: Request, res: Response): Promise<void> {
        try {
            const { questId, aipApproval } = req.body;
            if (!questId) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }
            const questIdNum = parseInt(questId);
            if (isNaN(questIdNum)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }
            const quest = await prisma.quest.findUnique({ where: { id: questIdNum } });
            if (!quest) {
                res.status(404).json({ success: false, error: { message: 'Quest not found' } });
                return;
            }
            if (quest.status !== 'PENDING_APPROVAL') {
                res.status(400).json({ success: false, error: { message: 'Quest is not completed and ready for approval' } });
                return;
            }
            if (!quest.claimedBy) {
                res.status(400).json({ success: false, error: { message: 'Quest has no claimant' } });
                return;
            }

            // Check authorization - only admins or quest creators can approve
            const user = (req as any).user;
            const isAdmin = user?.role === 'ADMIN';
            const isQuestCreator = quest.createdBy === userId;

            if (!isAdmin && !isQuestCreator) {
                res.status(403).json({ success: false, error: { message: 'Access denied. Only admins or quest creators can approve quests.' } });
                return;
            }

            // Prepare update data
            const updateData: any = {
                status: 'APPROVED',
                lastCompletedAt: new Date(), // Track when quest was last completed
            };

            // Create completion record for the user who completed the quest
            await prisma.questCompletion.create({
                data: {
                    questId: questIdNum,
                    userId: quest.claimedBy,
                    completedAt: quest.completedAt || new Date(),
                    approvedAt: new Date(),
                    status: 'APPROVED'
                }
            });

            // If quest is repeatable, set it to cooldown status instead of available
            if (quest.isRepeatable) {
                updateData.status = 'COOLDOWN';
                updateData.claimedBy = null;
                updateData.claimedAt = null;
                updateData.completedAt = null;
            }

            const updatedQuest = await prisma.quest.update({
                where: { id: questIdNum },
                data: updateData,
            });

            // Update user's bounty balance (always give bounty regardless of repeatable status)
            const userUpdate = await prisma.user.update({
                where: { id: quest.claimedBy },
                data: {
                    bountyBalance: {
                        increment: quest.bounty,
                    },
                },
                select: {
                    experience: true,
                }
            });

            // Calculate and award experience
            const experienceGained = calculateQuestExperience(quest.bounty);
            const oldExperience = userUpdate.experience;
            const newExperience = oldExperience + experienceGained;
            const leveledUp = checkLevelUp(oldExperience, newExperience);

            // Update user's experience
            await prisma.user.update({
                where: { id: quest.claimedBy },
                data: {
                    experience: newExperience,
                },
            });

            // Prepare response with level up information
            const response = {
                quest: updatedQuest,
                experienceGained,
                leveledUp,
                newLevel: leveledUp ? getLevelInfo(newExperience).level : null,
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error approving quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Reject quest completion (admin/editor only)
     */
    static async rejectQuest(req: Request, res: Response): Promise<void> {
        try {
            const { questId, reason } = req.body;
            if (!questId) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }
            const questIdNum = parseInt(questId);
            if (isNaN(questIdNum)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }
            const quest = await prisma.quest.findUnique({ where: { id: questIdNum } });
            if (!quest) {
                res.status(404).json({ success: false, error: { message: 'Quest not found' } });
                return;
            }
            if (quest.status !== 'PENDING_APPROVAL') {
                res.status(400).json({ success: false, error: { message: 'Quest is not completed and ready for approval' } });
                return;
            }
            if (!quest.claimedBy) {
                res.status(400).json({ success: false, error: { message: 'Quest has no claimant' } });
                return;
            }

            // Check authorization - only admins or quest creators can reject
            const user = (req as any).user;
            const isAdmin = user?.role === 'ADMIN';
            const isQuestCreator = quest.createdBy === userId;

            if (!isAdmin && !isQuestCreator) {
                res.status(403).json({ success: false, error: { message: 'Access denied. Only admins or quest creators can reject quests.' } });
                return;
            }

            // Validate rejection reason
            if (!reason || typeof reason !== 'string' || reason.trim() === '') {
                res.status(400).json({ success: false, error: { message: 'Rejection reason is required' } });
                return;
            }

            // Use a transaction to ensure data consistency
            const result = await prisma.$transaction(async (tx) => {
                // Create completion record for the user who completed the quest
                await tx.questCompletion.create({
                    data: {
                        questId: questIdNum,
                        userId: quest.claimedBy!, // We already checked that claimedBy is not null above
                        completedAt: quest.completedAt || new Date(),
                        status: 'REJECTED'
                    }
                });

                // Update quest status to rejected
                const updatedQuest = await tx.quest.update({
                    where: { id: questIdNum },
                    data: {
                        status: 'REJECTED',
                    },
                });

                return updatedQuest;
            });

            res.json({ success: true, data: { quest: result } } as ApiResponse);
        } catch (error) {
            console.error('Error rejecting quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get quests created by current user
     */
    static async getMyCreatedQuests(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const status = req.query['status'] as string;
            const search = req.query['search'] as string;
            const skip = (page - 1) * limit;

            const where: any = { createdBy: userId };
            if (status) {
                if (status.includes(',')) {
                    where.status = { in: status.split(',') };
                } else {
                    where.status = status;
                }
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [quests, total] = await Promise.all([
                prisma.quest.findMany({
                    where,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.quest.count({ where })
            ]);

            const response = {
                quests,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting my created quests:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get quests claimed by current user
     */
    static async getMyClaimedQuests(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const status = req.query['status'] as string;
            const search = req.query['search'] as string;
            const skip = (page - 1) * limit;

            const where: any = { claimedBy: userId };
            if (status) {
                if (status.includes(',')) {
                    where.status = { in: status.split(',') };
                } else {
                    where.status = status;
                }
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ];
            }

            const [quests, total] = await Promise.all([
                prisma.quest.findMany({
                    where,
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: [
                        // For completed/approved quests, order by completion date (newest first)
                        { completedAt: 'desc' },
                        // For other quests, order by creation date
                        { createdAt: 'desc' }
                    ],
                    skip,
                    take: limit,
                }),
                prisma.quest.count({ where })
            ]);

            const response = {
                quests,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting my claimed quests:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get repeatable quests available for claiming (respecting cooldown)
     */
    static async getRepeatableQuests(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const skip = (page - 1) * limit;

            // Get ALL repeatable quests (both available and on cooldown)
            const repeatableQuests = await prisma.quest.findMany({
                where: {
                    isRepeatable: true,
                    status: { in: ['AVAILABLE', 'COOLDOWN'] },
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
            });

            // Apply pagination
            const total = repeatableQuests.length;
            const paginatedQuests = repeatableQuests.slice(skip, skip + limit);

            const response = {
                quests: paginatedQuests,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting repeatable quests:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get required skills for a quest
     */
    static async getQuestRequiredSkills(req: Request, res: Response): Promise<void> {
        try {
            const questId = parseInt(req.params['id'] || '');
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }

            const requiredSkills = await prisma.questRequiredSkill.findMany({
                where: { questId },
                include: {
                    skill: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        }
                    }
                }
            });

            res.json({ success: true, data: requiredSkills } as ApiResponse);
        } catch (error) {
            console.error('Error getting quest required skills:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Add a required skill to a quest
     */
    static async addQuestRequiredSkill(req: Request, res: Response): Promise<void> {
        try {
            const questId = parseInt(req.params['id'] || '');
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }

            const { skillId, minLevel } = req.body;

            if (!skillId || typeof skillId !== 'number') {
                res.status(400).json({ success: false, error: { message: 'Skill ID is required' } });
                return;
            }

            if (!minLevel || typeof minLevel !== 'number' || minLevel < 1 || minLevel > 5) {
                res.status(400).json({ success: false, error: { message: 'Minimum level must be between 1 and 5' } });
                return;
            }

            // Check if quest exists
            const quest = await prisma.quest.findUnique({ where: { id: questId } });
            if (!quest) {
                res.status(404).json({ success: false, error: { message: 'Quest not found' } });
                return;
            }

            // Check if skill exists
            const skill = await prisma.skill.findUnique({ where: { id: skillId } });
            if (!skill) {
                res.status(404).json({ success: false, error: { message: 'Skill not found' } });
                return;
            }

            // Check if requirement already exists
            const existingRequirement = await prisma.questRequiredSkill.findUnique({
                where: { questId_skillId: { questId, skillId } }
            });

            if (existingRequirement) {
                res.status(400).json({ success: false, error: { message: 'Skill requirement already exists for this quest' } });
                return;
            }

            const requiredSkill = await prisma.questRequiredSkill.create({
                data: {
                    questId,
                    skillId,
                    minLevel
                },
                include: {
                    skill: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        }
                    }
                }
            });

            res.status(201).json({ success: true, data: requiredSkill } as ApiResponse);
        } catch (error) {
            console.error('Error adding quest required skill:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Update a required skill for a quest
     */
    static async updateQuestRequiredSkill(req: Request, res: Response): Promise<void> {
        try {
            const questId = parseInt(req.params['id'] || '');
            const skillId = parseInt(req.params['skillId'] || '');

            if (isNaN(questId) || isNaN(skillId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID or skill ID' } });
                return;
            }

            const { minLevel } = req.body;

            if (!minLevel || typeof minLevel !== 'number' || minLevel < 1 || minLevel > 5) {
                res.status(400).json({ success: false, error: { message: 'Minimum level must be between 1 and 5' } });
                return;
            }

            const requiredSkill = await prisma.questRequiredSkill.update({
                where: { questId_skillId: { questId, skillId } },
                data: { minLevel },
                include: {
                    skill: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        }
                    }
                }
            });

            res.json({ success: true, data: requiredSkill } as ApiResponse);
        } catch (error) {
            console.error('Error updating quest required skill:', error);
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
                res.status(404).json({ success: false, error: { message: 'Quest skill requirement not found' } });
            } else {
                res.status(500).json({ success: false, error: { message: 'Internal server error' } });
            }
        }
    }

    /**
     * Remove a required skill from a quest
     */
    static async removeQuestRequiredSkill(req: Request, res: Response): Promise<void> {
        try {
            const questId = parseInt(req.params['id'] || '');
            const skillId = parseInt(req.params['skillId'] || '');

            if (isNaN(questId) || isNaN(skillId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID or skill ID' } });
                return;
            }

            await prisma.questRequiredSkill.delete({
                where: { questId_skillId: { questId, skillId } }
            });

            res.json({ success: true, data: null } as ApiResponse);
        } catch (error) {
            console.error('Error removing quest required skill:', error);
            if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
                res.status(404).json({ success: false, error: { message: 'Quest skill requirement not found' } });
            } else {
                res.status(500).json({ success: false, error: { message: 'Internal server error' } });
            }
        }
    }

    /**
     * Create a quest with skill requirements (atomic operation)
     */
    static async createQuestWithSkills(req: Request, res: Response): Promise<void> {
        try {
            const { title, description, bounty, isRepeatable, cooldownDays, skillRequirements } = req.body;
            const userId = (req as any).user?.userId;

            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            if (!title || typeof title !== 'string' || title.trim().length === 0) {
                res.status(400).json({ success: false, error: { message: 'Title is required' } });
                return;
            }

            if (typeof bounty !== 'number' || bounty <= 0) {
                res.status(400).json({ success: false, error: { message: 'Bounty must be a positive number' } });
                return;
            }

            if (isRepeatable && (typeof cooldownDays !== 'number' || cooldownDays <= 0)) {
                res.status(400).json({ success: false, error: { message: 'Cooldown days must be a positive number for repeatable quests' } });
                return;
            }

            // Validate skill requirements if provided
            if (skillRequirements && Array.isArray(skillRequirements)) {
                for (const req of skillRequirements) {
                    if (typeof req.skillId !== 'number' || req.skillId <= 0) {
                        res.status(400).json({ success: false, error: { message: 'Invalid skill ID in requirements' } });
                        return;
                    }
                    if (typeof req.minLevel !== 'number' || req.minLevel < 1 || req.minLevel > 5) {
                        res.status(400).json({ success: false, error: { message: 'Skill level must be between 1 and 5' } });
                        return;
                    }
                }
            }

            // Use a transaction to ensure atomicity
            const result = await prisma.$transaction(async (tx) => {
                // Create the quest
                const quest = await tx.quest.create({
                    data: {
                        title,
                        description,
                        bounty,
                        status: 'AVAILABLE',
                        createdBy: userId,
                        isRepeatable: isRepeatable || false,
                        cooldownDays: isRepeatable ? cooldownDays : null,
                    },
                });

                // Add skill requirements if provided
                if (skillRequirements && skillRequirements.length > 0) {
                    const skillReqs = skillRequirements.map((req: any) => ({
                        questId: quest.id,
                        skillId: req.skillId,
                        minLevel: req.minLevel
                    }));

                    await tx.questRequiredSkill.createMany({
                        data: skillReqs
                    });
                }

                return quest;
            });

            res.status(201).json({ success: true, data: result } as ApiResponse);
        } catch (error) {
            console.error('Error creating quest with skills:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Update a quest with skill requirements (atomic operation)
     */
    static async updateQuestWithSkills(req: Request, res: Response): Promise<void> {
        try {
            const questIdParam = req.params['id'];
            if (!questIdParam) {
                res.status(400).json({ success: false, error: { message: 'Quest ID is required' } });
                return;
            }

            const questId = parseInt(questIdParam);
            if (isNaN(questId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid quest ID' } });
                return;
            }

            const { title, description, bounty, status, isRepeatable, cooldownDays, skillRequirements } = req.body;

            // Validate skill requirements if provided
            if (skillRequirements && Array.isArray(skillRequirements)) {
                for (const req of skillRequirements) {
                    if (typeof req.skillId !== 'number' || req.skillId <= 0) {
                        res.status(400).json({ success: false, error: { message: 'Invalid skill ID in requirements' } });
                        return;
                    }
                    if (typeof req.minLevel !== 'number' || req.minLevel < 1 || req.minLevel > 5) {
                        res.status(400).json({ success: false, error: { message: 'Skill level must be between 1 and 5' } });
                        return;
                    }
                }
            }

            // Use a transaction to ensure atomicity
            const result = await prisma.$transaction(async (tx) => {
                // Update the quest
                const updateFields: any = {};
                if (title !== undefined) updateFields.title = title;
                if (description !== undefined) updateFields.description = description;
                if (bounty !== undefined) updateFields.bounty = bounty;
                if (status !== undefined) updateFields.status = status;
                if (isRepeatable !== undefined) updateFields.isRepeatable = isRepeatable;
                if (cooldownDays !== undefined) {
                    if (isRepeatable && (typeof cooldownDays !== 'number' || cooldownDays <= 0)) {
                        throw new Error('Cooldown days must be a positive number for repeatable quests');
                    }
                    updateFields.cooldownDays = isRepeatable ? cooldownDays : null;
                }

                const quest = await tx.quest.update({
                    where: { id: questId },
                    data: updateFields,
                });

                // Remove all existing skill requirements
                await tx.questRequiredSkill.deleteMany({
                    where: { questId }
                });

                // Add new skill requirements if provided
                if (skillRequirements && skillRequirements.length > 0) {
                    const skillReqs = skillRequirements.map((req: any) => ({
                        questId: quest.id,
                        skillId: req.skillId,
                        minLevel: req.minLevel
                    }));

                    await tx.questRequiredSkill.createMany({
                        data: skillReqs
                    });
                }

                return quest;
            });

            res.json({ success: true, data: result } as ApiResponse);
        } catch (error) {
            console.error('Error updating quest with skills:', error);
            if (error instanceof Error) {
                res.status(400).json({ success: false, error: { message: error.message } });
            } else {
                res.status(500).json({ success: false, error: { message: 'Internal server error' } });
            }
        }
    }

    /**
     * Get user's completion history (including repeatable quests that have been reset)
     */
    static async getMyCompletionHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const search = req.query['search'] as string;
            const skip = (page - 1) * limit;

            // Get quests that the user has completed from the QuestCompletion table
            const where: any = {
                userId: userId
            };

            if (search) {
                where.quest = {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                };
            }

            const [completions, total] = await Promise.all([
                prisma.questCompletion.findMany({
                    where,
                    include: {
                        quest: {
                            include: {
                                creator: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        role: true,
                                    }
                                },
                                claimer: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        role: true,
                                    }
                                }
                            }
                        }
                    },
                    orderBy: [
                        { approvedAt: 'desc' },
                        { completedAt: 'desc' }
                    ],
                    skip,
                    take: limit,
                }),
                prisma.questCompletion.count({ where })
            ]);

            // Transform completions to quest format for frontend compatibility
            const processedQuests = completions.map(completion => ({
                ...completion.quest,
                // Override status to show completion status
                status: completion.status,
                // Use completion dates from the completion record
                completedAt: completion.completedAt.toISOString(),
                // Mark as completed for display purposes
                _displayStatus: 'COMPLETED_HISTORY',
                _completionDate: completion.completedAt.toISOString(),
                _approvalStatus: completion.status,
                _approvedAt: completion.approvedAt?.toISOString(),
                // Clear any existing completion info to avoid duplication
                lastCompletedAt: null
            }));

            const response = {
                quests: processedQuests,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting completion history:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get quests pending approval (admin/editor only)
     */
    static async getPendingApprovalQuests(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin or Editor role required.' }
                } as ApiResponse);
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const skip = (page - 1) * limit;

            const [quests, total] = await Promise.all([
                prisma.quest.findMany({
                    where: { status: 'COMPLETED' },
                    include: {
                        creator: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        },
                        claimer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: { completedAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.quest.count({ where: { status: 'COMPLETED' } })
            ]);

            const response = {
                quests,
                pagination: {
                    currentPage: page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting pending approval quests:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }
}
