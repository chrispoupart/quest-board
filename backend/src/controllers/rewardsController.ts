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

            // Input validation
            if (
                typeof monthlyBountyReward !== 'number' ||
                typeof monthlyQuestReward !== 'number' ||
                typeof quarterlyCollectiveGoal !== 'number' ||
                typeof quarterlyCollectiveReward !== 'string' ||
                quarterlyCollectiveReward.trim() === ''
            ) {
                res.status(400).json({
                    success: false,
                    error: 'All fields are required and must be of the correct type.'
                });
                return;
            }

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

    static async getCollectiveProgress(req: Request, res: Response): Promise<void> {
        try {
            const { quarter } = req.query;
            if (!quarter || typeof quarter !== 'string' || !/^\d{4}-Q[1-4]$/.test(quarter)) {
                res.status(400).json({ error: 'Invalid or missing quarter parameter (expected YYYY-QN)' });
                return;
            }
            const [yearStr, qStr] = quarter.split('-Q');
            const year = parseInt(yearStr, 10);
            const q = parseInt(qStr, 10);
            if (isNaN(year) || isNaN(q) || q < 1 || q > 4) {
                res.status(400).json({ error: 'Invalid quarter parameter' });
                return;
            }
            // Calculate start and end of the quarter
            const startMonth = (q - 1) * 3;
            const start = new Date(year, startMonth, 1);
            const end = new Date(year, startMonth + 3, 1);

            // Get reward config
            const config = await prisma.rewardConfig.findFirst();
            const goal = config?.quarterlyCollectiveGoal || 0;
            const reward = config?.quarterlyCollectiveReward || '';

            // Find all approved quest completions in this quarter
            const completions = await prisma.questCompletion.findMany({
                where: {
                    completedAt: {
                        gte: start,
                        lt: end
                    },
                    status: 'APPROVED'
                },
                include: {
                    quest: true
                }
            });

            // Sum bounty from completions
            let progress = 0;
            for (const c of completions) {
                if (c.quest) {
                    progress += c.quest.bounty || 0;
                }
            }
            const percent = goal > 0 ? (progress / goal) * 100 : 0;
            res.status(200).json({ goal, reward, progress, percent });
        } catch (error) {
            console.error('Error getting collective reward progress:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
} 
