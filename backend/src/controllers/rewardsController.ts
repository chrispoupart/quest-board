import { Request, Response } from 'express';
import { prisma } from '../db';

export class RewardsController {
    static async getConfig(req: Request, res: Response): Promise<void> {
        try {
            let config = await prisma.rewardConfig.findFirst();
            if (!config) {
                // Return default config if none exists
                config = {
                    id: 0,
                    monthlyBountyReward: 0,
                    monthlyQuestReward: 0,
                    quarterlyCollectiveGoal: 0,
                    quarterlyCollectiveReward: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
            }
            res.status(200).json(config);
        } catch (error) {
            console.error('Error getting reward config:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }

    static async updateConfig(req: Request, res: Response): Promise<void> {
        try {
            const { monthlyBountyReward, monthlyQuestReward, quarterlyCollectiveGoal, quarterlyCollectiveReward } = req.body;
            let config = await prisma.rewardConfig.findFirst();
            if (config) {
                await prisma.rewardConfig.update({
                    where: { id: config.id },
                    data: {
                        monthlyBountyReward,
                        monthlyQuestReward,
                        quarterlyCollectiveGoal,
                        quarterlyCollectiveReward,
                    },
                });
            } else {
                await prisma.rewardConfig.create({
                    data: {
                        monthlyBountyReward,
                        monthlyQuestReward,
                        quarterlyCollectiveGoal,
                        quarterlyCollectiveReward,
                    },
                });
            }
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error updating reward config:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
} 
