import { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { prisma } from '../db';

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

            const transactionResult = await prisma.$transaction(async (tx) => {
                const item = await tx.storeItem.findUnique({ where: { id: itemId } });
                if (!item) {
                    throw new Error('Store item not found');
                }
                if (!item.isActive) {
                    throw new Error('Item is not available for purchase');
                }

                const user = await tx.user.findUnique({ where: { id: userId } });
                if (!user) {
                    throw new Error('User not found');
                }
                if (user.bountyBalance < item.cost) {
                    throw new Error('Insufficient bounty balance');
                }

                await tx.user.update({
                    where: { id: userId },
                    data: { bountyBalance: { decrement: item.cost } }
                });

                const newTransaction = await tx.storeTransaction.create({
                    data: {
                        itemId: item.id,
                        buyerId: userId,
                        sellerId: item.createdBy,
                        amount: item.cost,
                        status: 'PENDING',
                    },
                    include: {
                        item: { include: { creator: true } },
                        buyer: true
                    }
                });

                return newTransaction;
            });

            res.status(201).json({ success: true, data: transactionResult } as ApiResponse);

        } catch (error: any) {
            console.error('Error purchasing item:', error);
            if (error.message.includes('not found') || error.message.includes('Insufficient')) {
                res.status(400).json({ success: false, error: { message: error.message } });
            } else {
                res.status(500).json({ success: false, error: { message: 'Internal server error' } });
            }
        }
    }

    /**
     * Get a user's purchase history
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
            const skip = (page - 1) * limit;

            const [transactions, total] = await Promise.all([
                prisma.storeTransaction.findMany({
                    where: { buyerId: userId },
                    include: {
                        item: true
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
                }),
                prisma.storeTransaction.count({ where: { buyerId: userId } })
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
     * Get pending transactions for admin/editor to approve
     */
    static async getPendingTransactions(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query['page'] as string) || 1;
            const limit = parseInt(req.query['limit'] as string) || 10;
            const skip = (page - 1) * limit;

            const [transactions, total] = await Promise.all([
                prisma.storeTransaction.findMany({
                    where: { status: 'PENDING' },
                    include: {
                        item: true,
                        buyer: true,
                        seller: true
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit
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
     * Update a transaction's status (approve/reject)
     */
    static async updateTransaction(req: Request, res: Response): Promise<void> {
        try {
            const transactionId = parseInt(req.params['id']);
            const { status, notes } = req.body;
            const processorId = (req as any).user?.userId;

            if (isNaN(transactionId)) {
                res.status(400).json({ success: false, error: { message: 'Invalid transaction ID' } });
                return;
            }
            if (!['APPROVED', 'REJECTED'].includes(status)) {
                res.status(400).json({ success: false, error: { message: 'Invalid status' } });
                return;
            }

            const transactionToUpdate = await prisma.storeTransaction.findUnique({
                where: { id: transactionId },
            });

            if (!transactionToUpdate) {
                res.status(404).json({ success: false, error: { message: 'Transaction not found' } });
                return;
            }
            if (transactionToUpdate.status !== 'PENDING') {
                res.status(400).json({ success: false, error: { message: 'Transaction has already been processed' } });
                return;
            }

            const updatedTransaction = await prisma.$transaction(async (tx) => {
                const transaction = await tx.storeTransaction.update({
                    where: { id: transactionId },
                    data: {
                        status,
                        notes,
                        processedBy: processorId,
                        processedAt: new Date(),
                    },
                });

                if (status === 'APPROVED') {
                    // Transfer bounty to the seller
                    await tx.user.update({
                        where: { id: transaction.sellerId },
                        data: { bountyBalance: { increment: transaction.amount } },
                    });
                } else if (status === 'REJECTED') {
                    // Refund bounty to the buyer
                    await tx.user.update({
                        where: { id: transaction.buyerId },
                        data: { bountyBalance: { increment: transaction.amount } },
                    });
                }
                return transaction;
            });

            res.json({ success: true, data: updatedTransaction } as ApiResponse);
        } catch (error) {
            console.error('Error updating transaction:', error);
            res.status(500).json({ success: false, error: { message: 'Internal server error' } });
        }
    }
}
