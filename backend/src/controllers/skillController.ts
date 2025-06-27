import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserRole, ApiResponse, CreateSkillRequest, UpdateSkillRequest, CreateUserSkillRequest, UpdateUserSkillRequest } from '../types';
import { validateUserRole } from '../utils/validation';

const prisma = new PrismaClient();

export class SkillController {
    /**
     * Get all skills (admin only)
     */
    static async getAllSkills(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const skills = await prisma.skill.findMany({
                where: { isActive: true },
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
                orderBy: {
                    name: 'asc'
                }
            });

            res.json({
                success: true,
                data: skills
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting all skills:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get skills for quest creation (admin and editor)
     */
    static async getSkillsForQuestCreation(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN' && userRole !== 'EDITOR') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin or Editor role required.' }
                } as ApiResponse);
                return;
            }

            const skills = await prisma.skill.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    isActive: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            res.json({
                success: true,
                data: skills
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting skills for quest creation:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Create a new skill (admin only)
     */
    static async createSkill(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;
            const userId = (req as any).user?.userId;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const { name, description }: CreateSkillRequest = req.body;

            if (!name) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Skill name is required' }
                } as ApiResponse);
                return;
            }

            // Check if skill already exists
            const existingSkill = await prisma.skill.findUnique({
                where: { name }
            });

            if (existingSkill) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Skill with this name already exists' }
                } as ApiResponse);
                return;
            }

            const createData: any = {
                name,
                createdBy: userId
            };

            if (description !== undefined) {
                createData.description = description;
            }

            const skill = await prisma.skill.create({
                data: createData,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    }
                }
            });

            res.status(201).json({
                success: true,
                data: skill
            } as ApiResponse);
        } catch (error) {
            console.error('Error creating skill:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Update a skill (admin only)
     */
    static async updateSkill(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const skillId = parseInt(req.params['id'] || '');
            if (isNaN(skillId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid skill ID' }
                } as ApiResponse);
                return;
            }

            const { name, description, isActive }: UpdateSkillRequest = req.body;

            // Check if skill exists
            const existingSkill = await prisma.skill.findUnique({
                where: { id: skillId }
            });

            if (!existingSkill) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Skill not found' }
                } as ApiResponse);
                return;
            }

            // Check if name is being changed and if it conflicts
            if (name && name !== existingSkill.name) {
                const nameConflict = await prisma.skill.findUnique({
                    where: { name }
                });

                if (nameConflict) {
                    res.status(400).json({
                        success: false,
                        error: { message: 'Skill with this name already exists' }
                    } as ApiResponse);
                    return;
                }
            }

            const updateData: any = {};
            if (name !== undefined) updateData.name = name;
            if (description !== undefined) updateData.description = description;
            if (isActive !== undefined) updateData.isActive = isActive;

            const updatedSkill = await prisma.skill.update({
                where: { id: skillId },
                data: updateData,
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    }
                }
            });

            res.json({
                success: true,
                data: updatedSkill
            } as ApiResponse);
        } catch (error) {
            console.error('Error updating skill:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Delete a skill (admin only)
     */
    static async deleteSkill(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const skillId = parseInt(req.params['id'] || '');
            if (isNaN(skillId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid skill ID' }
                } as ApiResponse);
                return;
            }

            // Check if skill exists
            const existingSkill = await prisma.skill.findUnique({
                where: { id: skillId }
            });

            if (!existingSkill) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Skill not found' }
                } as ApiResponse);
                return;
            }

            // Check if skill is being used in any quests
            const questUsage = await prisma.questRequiredSkill.findFirst({
                where: { skillId }
            });

            if (questUsage) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Cannot delete skill that is required by quests. Remove skill requirements first.' }
                } as ApiResponse);
                return;
            }

            // Check if skill is assigned to any users
            const userUsage = await prisma.userSkill.findFirst({
                where: { skillId }
            });

            if (userUsage) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Cannot delete skill that is assigned to users. Remove user skill assignments first.' }
                } as ApiResponse);
                return;
            }

            await prisma.skill.delete({
                where: { id: skillId }
            });

            res.json({
                success: true,
                data: null
            } as ApiResponse);
        } catch (error) {
            console.error('Error deleting skill:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get user skills (admin only)
     */
    static async getUserSkills(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const targetUserId = parseInt(req.params['userId'] || '');
            if (isNaN(targetUserId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid user ID' }
                } as ApiResponse);
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const skip = (page - 1) * limit;

            const [userSkills, total] = await Promise.all([
                prisma.userSkill.findMany({
                    where: { userId: targetUserId },
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    },
                    orderBy: { level: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.userSkill.count({ where: { userId: targetUserId } })
            ]);

            const response = {
                userSkills,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({
                success: true,
                data: response
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting user skills:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get current user's skills (authenticated users can view their own skills)
     */
    static async getMySkills(req: Request, res: Response): Promise<void> {
        try {
            const currentUserId = (req as any).user?.userId;
            if (!currentUserId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'User not authenticated' }
                } as ApiResponse);
                return;
            }

            const userSkills = await prisma.userSkill.findMany({
                where: { userId: currentUserId },
                include: {
                    skill: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        }
                    }
                },
                orderBy: { level: 'desc' },
            });

            res.json({
                success: true,
                data: userSkills
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting my skills:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Get a specific user skill level (admin only)
     */
    static async getUserSkillLevel(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const userId = parseInt(req.params['userId'] || '');
            const skillId = parseInt(req.params['skillId'] || '');

            if (isNaN(userId) || isNaN(skillId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid user ID or skill ID' }
                } as ApiResponse);
                return;
            }

            const userSkill = await prisma.userSkill.findUnique({
                where: { userId_skillId: { userId, skillId } },
                select: { level: true }
            });

            res.json({
                success: true,
                data: { level: userSkill?.level || 0 }
            } as ApiResponse);
        } catch (error) {
            console.error('Error getting user skill level:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Update user skill (admin only)
     */
    static async updateUserSkill(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const userId = parseInt(req.params['userId'] || '');
            if (isNaN(userId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid user ID' }
                } as ApiResponse);
                return;
            }

            const { level }: UpdateUserSkillRequest = req.body;

            if (!level || typeof level !== 'number' || level < 1 || level > 5) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Level must be between 1 and 5' }
                } as ApiResponse);
                return;
            }

            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                res.status(404).json({
                    success: false,
                    error: { message: 'User not found' }
                } as ApiResponse);
                return;
            }

            // For this endpoint, we need skillId in the body or URL
            // Let me check if it's in the body or if we need to modify the route
            const { skillId } = req.body;

            if (!skillId || typeof skillId !== 'number') {
                res.status(400).json({
                    success: false,
                    error: { message: 'Skill ID is required' }
                } as ApiResponse);
                return;
            }

            // Check if skill exists
            const skill = await prisma.skill.findUnique({
                where: { id: skillId }
            });

            if (!skill) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Skill not found' }
                } as ApiResponse);
                return;
            }

            // Check if user already has this skill
            const existingUserSkill = await prisma.userSkill.findUnique({
                where: { userId_skillId: { userId, skillId } }
            });

            if (existingUserSkill) {
                // Update existing skill
                const updatedUserSkill = await prisma.userSkill.update({
                    where: { userId_skillId: { userId, skillId } },
                    data: { level },
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    }
                });

                res.json({
                    success: true,
                    data: updatedUserSkill
                } as ApiResponse);
            } else {
                // Create new user skill
                const newUserSkill = await prisma.userSkill.create({
                    data: {
                        userId,
                        skillId,
                        level
                    },
                    include: {
                        skill: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            }
                        },
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    }
                });

                res.status(201).json({
                    success: true,
                    data: newUserSkill
                } as ApiResponse);
            }
        } catch (error) {
            console.error('Error updating user skill:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }

    /**
     * Remove user skill (admin only)
     */
    static async removeUserSkill(req: Request, res: Response): Promise<void> {
        try {
            const userRole = (req as any).user?.role;

            if (userRole !== 'ADMIN') {
                res.status(403).json({
                    success: false,
                    error: { message: 'Access denied. Admin role required.' }
                } as ApiResponse);
                return;
            }

            const userId = parseInt(req.params['userId'] || '');
            const skillId = parseInt(req.params['skillId'] || '');

            if (isNaN(userId) || isNaN(skillId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Invalid user ID or skill ID' }
                } as ApiResponse);
                return;
            }

            // Check if user skill exists
            const existingUserSkill = await prisma.userSkill.findUnique({
                where: { userId_skillId: { userId, skillId } }
            });

            if (!existingUserSkill) {
                res.status(404).json({
                    success: false,
                    error: { message: 'User skill not found' }
                } as ApiResponse);
                return;
            }

            await prisma.userSkill.delete({
                where: { userId_skillId: { userId, skillId } }
            });

            res.json({
                success: true,
                data: null
            } as ApiResponse);
        } catch (error) {
            console.error('Error removing user skill:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Internal server error' }
            } as ApiResponse);
        }
    }
}
