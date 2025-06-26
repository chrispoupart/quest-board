import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse, UserRole } from '../types';

const prisma = new PrismaClient();

export class QuestController {
    /**
     * List all quests
     */
    static async getAllQuests(req: Request, res: Response): Promise<void> {
        try {
            const quests = await prisma.quest.findMany({
                orderBy: { createdAt: 'desc' },
            });
            res.json({ success: true, data: quests } as ApiResponse);
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
            const { title, description, bounty } = req.body;
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
            const quest = await prisma.quest.create({
                data: {
                    title,
                    description,
                    bounty,
                    status: 'AVAILABLE',
                    createdBy: userId,
                },
            });
            res.status(201).json({ success: true, data: quest } as ApiResponse);
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
            const { title, description, bounty, status } = req.body;
            const updateFields: any = {};
            if (title !== undefined) updateFields.title = title;
            if (description !== undefined) updateFields.description = description;
            if (bounty !== undefined) updateFields.bounty = bounty;
            if (status !== undefined) updateFields.status = status;
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
            res.json({ success: true, data: { id: questId } } as ApiResponse);
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
            const quest = await prisma.quest.findUnique({ where: { id: questId } });
            if (!quest) {
                res.status(404).json({ success: false, error: { message: 'Quest not found' } });
                return;
            }
            if (quest.status !== 'AVAILABLE') {
                res.status(400).json({ success: false, error: { message: 'Quest is not available for claiming' } });
                return;
            }
            const updatedQuest = await prisma.quest.update({
                where: { id: questId },
                data: {
                    status: 'CLAIMED',
                    claimedBy: userId,
                    claimedAt: new Date(),
                },
            });
            res.json({ success: true, data: updatedQuest } as ApiResponse);
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
            if (quest.status !== 'CLAIMED' || quest.claimedBy !== userId) {
                res.status(400).json({ success: false, error: { message: 'Quest is not claimed by you' } });
                return;
            }
            const updatedQuest = await prisma.quest.update({
                where: { id: questId },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });
            res.json({ success: true, data: updatedQuest } as ApiResponse);
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
            if (quest.status !== 'COMPLETED') {
                res.status(400).json({ success: false, error: { message: 'Quest is not completed' } });
                return;
            }
            if (!quest.claimedBy) {
                res.status(400).json({ success: false, error: { message: 'Quest has no claimant' } });
                return;
            }
            const updatedQuest = await prisma.quest.update({
                where: { id: questId },
                data: {
                    status: 'APPROVED',
                },
            });
            // Update user's bounty balance
            await prisma.user.update({
                where: { id: quest.claimedBy },
                data: {
                    bountyBalance: {
                        increment: quest.bounty,
                    },
                },
            });
            res.json({ success: true, data: updatedQuest } as ApiResponse);
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
            if (quest.status !== 'COMPLETED') {
                res.status(400).json({ success: false, error: { message: 'Quest is not completed' } });
                return;
            }
            const updatedQuest = await prisma.quest.update({
                where: { id: questId },
                data: {
                    status: 'REJECTED',
                },
            });
            res.json({ success: true, data: updatedQuest } as ApiResponse);
        } catch (error) {
            console.error('Error rejecting quest:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }
}
