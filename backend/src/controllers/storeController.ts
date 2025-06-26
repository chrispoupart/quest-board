import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';

const prisma = new PrismaClient();

export class StoreController {
    /**
     * Get all active store items
     */
    static async getStoreItems(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const skip = (page - 1) * limit;

            const [items, total] = await Promise.all([
                prisma.storeItem.findMany({
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
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma.storeItem.count({ where: { isActive: true } })
            ]);

            const response = {
                items,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting store items:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get store item by ID
     */
    static async getStoreItemById(req: Request, res: Response): Promise<void> {
        try {
            const itemIdParam = req.params['id'];
            if (!itemIdParam) {
                res.status(400).json({ success: false, error: { message: 'Item ID is required' } });
                return;
            }
            const itemId = parseInt(itemIdParam);
            if (isNaN(itemId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid item ID' } });
                return;
            }

            const item = await prisma.storeItem.findUnique({
                where: { id: itemId },
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

            if (!item) {
                res.status(404).json({ success: false, error: { message: 'Store item not found' } });
                return;
            }

            res.json({ success: true, data: item } as ApiResponse);
        } catch (error) {
            console.error('Error getting store item by ID:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Create a new store item (admin/editor only)
     */
    static async createStoreItem(req: Request, res: Response): Promise<void> {
        try {
            const { name, description, cost } = req.body;
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                res.status(400).json({ success: false, error: { message: 'Name is required' } });
                return;
            }
            if (typeof cost !== 'number' || cost <= 0) {
                res.status(400).json({ success: false, error: { message: 'Cost must be a positive number' } });
                return;
            }

            const item = await prisma.storeItem.create({
                data: {
                    name,
                    description,
                    cost,
                    createdBy: userId,
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
                }
            });

            res.status(201).json({ success: true, data: item } as ApiResponse);
        } catch (error) {
            console.error('Error creating store item:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Update a store item (admin/editor only)
     */
    static async updateStoreItem(req: Request, res: Response): Promise<void> {
        try {
            const itemIdParam = req.params['id'];
            if (!itemIdParam) {
                res.status(400).json({ success: false, error: { message: 'Item ID is required' } });
                return;
            }
            const itemId = parseInt(itemIdParam);
            if (isNaN(itemId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid item ID' } });
                return;
            }

            const { name, description, cost, isActive } = req.body;
            const updateFields: any = {};
            if (name !== undefined) updateFields.name = name;
            if (description !== undefined) updateFields.description = description;
            if (cost !== undefined) updateFields.cost = cost;
            if (isActive !== undefined) updateFields.isActive = isActive;

            const item = await prisma.storeItem.update({
                where: { id: itemId },
                data: updateFields,
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

            res.json({ success: true, data: item } as ApiResponse);
        } catch (error) {
            console.error('Error updating store item:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Delete a store item (admin only)
     */
    static async deleteStoreItem(req: Request, res: Response): Promise<void> {
        try {
            const itemIdParam = req.params['id'];
            if (!itemIdParam) {
                res.status(400).json({ success: false, error: { message: 'Item ID is required' } });
                return;
            }
            const itemId = parseInt(itemIdParam);
            if (isNaN(itemId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid item ID' } });
                return;
            }

            await prisma.storeItem.delete({ where: { id: itemId } });
            res.json({ success: true, data: { id: itemId } } as ApiResponse);
        } catch (error) {
            console.error('Error deleting store item:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Purchase an item from the store
     */
    static async purchaseItem(req: Request, res: Response): Promise<void> {
        try {
            const { itemId } = req.body;
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }
            if (!itemId || typeof itemId !== 'number') {
                res.status(400).json({ success: false, error: { message: 'Item ID is required' } });
                return;
            }

            // Get the item and user
            const [item, user] = await Promise.all([
                prisma.storeItem.findUnique({ where: { id: itemId } }),
                prisma.user.findUnique({ where: { id: userId } })
            ]);

            if (!item) {
                res.status(404).json({ success: false, error: { message: 'Store item not found' } });
                return;
            }

            if (!item.isActive) {
                res.status(400).json({ success: false, error: { message: 'Item is not available for purchase' } });
                return;
            }

            if (!user) {
                res.status(404).json({ success: false, error: { message: 'User not found' } });
                return;
            }

            if (user.bountyBalance < item.cost) {
                res.status(400).json({ success: false, error: { message: 'Insufficient bounty balance' } });
                return;
            }

            // Create transaction and deduct bounty
            const transaction = await prisma.$transaction(async (tx) => {
                // Deduct bounty from user
                await tx.user.update({
                    where: { id: userId },
                    data: { bountyBalance: { decrement: item.cost } }
                });

                // Create store transaction
                return await tx.storeTransaction.create({
                    data: {
                        itemId,
                        buyerId: userId,
                        status: 'PENDING'
                    },
                    include: {
                        item: {
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
                        },
                        buyer: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            }
                        }
                    }
                });
            });

            res.status(201).json({ success: true, data: transaction } as ApiResponse);
        } catch (error) {
            console.error('Error purchasing item:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get user's purchase history
     */
    static async getUserPurchases(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const status = req.query['status'] as string;
            const skip = (page - 1) * limit;

            const where: any = { buyerId: userId };
            if (status) {
                if (status.includes(',')) {
                    where.status = { in: status.split(',') };
                } else {
                    where.status = status;
                }
            }

            const [transactions, total] = await Promise.all([
                prisma.storeTransaction.findMany({
                    where,
                    include: {
                        item: {
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
                        },
                        buyer: {
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
                prisma.storeTransaction.count({ where })
            ]);

            const response = {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting user purchases:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Get all pending transactions (admin/editor only)
     */
    static async getPendingTransactions(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, error: { message: 'User not authenticated' } });
                return;
            }

            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const skip = (page - 1) * limit;

            const [transactions, total] = await Promise.all([
                prisma.storeTransaction.findMany({
                    where: { status: 'PENDING' },
                    include: {
                        item: {
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
                        },
                        buyer: {
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
                prisma.storeTransaction.count({ where: { status: 'PENDING' } })
            ]);

            const response = {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

            res.json({ success: true, data: response } as ApiResponse);
        } catch (error) {
            console.error('Error getting pending transactions:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }

    /**
     * Approve or reject a transaction (admin/editor only)
     */
    static async updateTransaction(req: Request, res: Response): Promise<void> {
        try {
            const transactionIdParam = req.params['id'];
            if (!transactionIdParam) {
                res.status(400).json({ success: false, error: { message: 'Transaction ID is required' } });
                return;
            }
            const transactionId = parseInt(transactionIdParam);
            if (isNaN(transactionId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid transaction ID' } });
                return;
            }

            const { status, notes } = req.body;
            if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
                res.status(400).json({ success: false, error: { message: 'Status must be APPROVED or REJECTED' } });
                return;
            }

            const transaction = await prisma.storeTransaction.findUnique({
                where: { id: transactionId },
                include: {
                    item: true,
                    buyer: true
                }
            });

            if (!transaction) {
                res.status(404).json({ success: false, error: { message: 'Transaction not found' } });
                return;
            }

            if (transaction.status !== 'PENDING') {
                res.status(400).json({ success: false, error: { message: 'Transaction is not pending' } });
                return;
            }

            // If rejecting, refund the bounty
            if (status === 'REJECTED') {
                await prisma.$transaction(async (tx) => {
                    // Refund bounty to user
                    await tx.user.update({
                        where: { id: transaction.buyerId },
                        data: { bountyBalance: { increment: transaction.item.cost } }
                    });

                    // Update transaction status
                    await tx.storeTransaction.update({
                        where: { id: transactionId },
                        data: { status, notes }
                    });
                });
            } else {
                // Just update the status for approval
                await prisma.storeTransaction.update({
                    where: { id: transactionId },
                    data: { status, notes }
                });
            }

            const updatedTransaction = await prisma.storeTransaction.findUnique({
                where: { id: transactionId },
                include: {
                    item: {
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
                    },
                    buyer: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    }
                }
            });

            res.json({ success: true, data: updatedTransaction } as ApiResponse);
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }
}
