import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { storeService } from '../../services/storeService';
import { StoreItem, StoreTransaction } from '../../types';
import { toast } from 'sonner';

export const StoreManagement: React.FC = () => {
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [pendingTransactions, setPendingTransactions] = useState<StoreTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('items');

    // Item management state
    const [itemDialogOpen, setItemDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItem | null>(null);
    const [itemForm, setItemForm] = useState({
        name: '',
        description: '',
        cost: 0,
        isActive: true
    });

    // Transaction management state
    const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<StoreTransaction | null>(null);
    const [transactionNotes, setTransactionNotes] = useState('');
    const [transactionAction, setTransactionAction] = useState<'APPROVED' | 'REJECTED' | null>(null);

    useEffect(() => {
        loadStoreData();
    }, []);

    const loadStoreData = async () => {
        try {
            setLoading(true);
            const [itemsResponse, transactionsResponse] = await Promise.all([
                storeService.getStoreItems({ limit: 100 }),
                storeService.getPendingTransactions()
            ]);
            setStoreItems(itemsResponse.items);
            setPendingTransactions(transactionsResponse.transactions);
        } catch (error) {
            console.error('Error loading store data:', error);
            toast.error('Failed to load store data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = () => {
        setEditingItem(null);
        setItemForm({
            name: '',
            description: '',
            cost: 0,
            isActive: true
        });
        setItemDialogOpen(true);
    };

    const handleEditItem = (item: StoreItem) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            description: item.description || '',
            cost: item.cost,
            isActive: item.isActive
        });
        setItemDialogOpen(true);
    };

    const handleSaveItem = async () => {
        try {
            if (!itemForm.name.trim()) {
                toast.error('Item name is required');
                return;
            }
            if (itemForm.cost <= 0) {
                toast.error('Cost must be greater than 0');
                return;
            }

            if (editingItem) {
                await storeService.updateStoreItem(editingItem.id, itemForm);
                toast.success('Store item updated successfully');
            } else {
                await storeService.createStoreItem({
                    name: itemForm.name,
                    description: itemForm.description,
                    cost: itemForm.cost
                });
                toast.success('Store item created successfully');
            }

            setItemDialogOpen(false);
            loadStoreData();
        } catch (error) {
            console.error('Error saving store item:', error);
            toast.error('Failed to save store item');
        }
    };

    const handleDeleteItem = async (itemId: number) => {
        if (!confirm('Are you sure you want to delete this store item?')) {
            return;
        }

        try {
            await storeService.deleteStoreItem(itemId);
            toast.success('Store item deleted successfully');
            loadStoreData();
        } catch (error) {
            console.error('Error deleting store item:', error);
            toast.error('Failed to delete store item');
        }
    };

    const handleTransactionAction = (transaction: StoreTransaction, action: 'APPROVED' | 'REJECTED') => {
        setSelectedTransaction(transaction);
        setTransactionAction(action);
        setTransactionNotes('');
        setTransactionDialogOpen(true);
    };

    const confirmTransactionAction = async () => {
        if (!selectedTransaction || !transactionAction) return;

        try {
            await storeService.updateTransaction(selectedTransaction.id, {
                status: transactionAction,
                notes: transactionNotes || undefined
            });

            toast.success(`Transaction ${transactionAction.toLowerCase()} successfully`);
            setTransactionDialogOpen(false);
            setSelectedTransaction(null);
            setTransactionAction(null);
            loadStoreData();
        } catch (error) {
            console.error('Error updating transaction:', error);
            toast.error('Failed to update transaction');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2">Loading store management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🏪 Store Management</h1>
                <p className="text-gray-600">Manage store items and approve purchase requests</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="items">Store Items</TabsTrigger>
                    <TabsTrigger value="transactions">
                        Pending Transactions ({pendingTransactions.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Store Items</h2>
                        <Button onClick={handleCreateItem}>
                            Add New Item
                        </Button>
                    </div>

                    {storeItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No store items available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {storeItems.map((item) => (
                                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    {item.description || 'No description available'}
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="outline">
                                                    {item.cost} pts
                                                </Badge>
                                                <Badge variant={item.isActive ? "default" : "secondary"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Added by {item.creator?.name || 'Unknown'}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditItem(item)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="transactions" className="mt-6">
                    <h2 className="text-xl font-semibold mb-6">Pending Purchase Requests</h2>

                    {pendingTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No pending transactions.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingTransactions.map((transaction) => (
                                <Card key={transaction.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{transaction.item?.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {transaction.item?.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm text-gray-500">
                                                        Cost: {transaction.item?.cost} points
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Requested by: {transaction.buyer?.name}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Date: {formatDate(transaction.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleTransactionAction(transaction, 'APPROVED')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleTransactionAction(transaction, 'REJECTED')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Item Management Dialog */}
            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? 'Edit Store Item' : 'Create New Store Item'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingItem ? 'Update the store item details.' : 'Add a new item to the store.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name">Name *</label>
                            <Input
                                id="name"
                                value={itemForm.name}
                                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                placeholder="Enter item name"
                            />
                        </div>
                        <div>
                            <label htmlFor="description">Description</label>
                            <Textarea
                                id="description"
                                value={itemForm.description}
                                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                placeholder="Enter item description"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label htmlFor="cost">Cost (points) *</label>
                            <Input
                                id="cost"
                                type="number"
                                min="1"
                                value={itemForm.cost}
                                onChange={(e) => setItemForm({ ...itemForm, cost: parseInt(e.target.value) || 0 })}
                                placeholder="Enter cost in points"
                            />
                        </div>
                        {editingItem && (
                            <div className="flex items-center space-x-2">
                                <input
                                    id="isActive"
                                    type="checkbox"
                                    checked={itemForm.isActive}
                                    onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive">Active</label>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveItem}>
                            {editingItem ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Transaction Action Dialog */}
            <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {transactionAction === 'APPROVED' ? 'Approve' : 'Reject'} Purchase Request
                        </DialogTitle>
                        <DialogDescription>
                            {transactionAction === 'APPROVED'
                                ? 'Approve this purchase request. The user will receive their reward.'
                                : 'Reject this purchase request. The user will be refunded their bounty points.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="py-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold">{selectedTransaction.item?.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Requested by: {selectedTransaction.buyer?.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Cost: {selectedTransaction.item?.cost} points
                                </p>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="notes">Notes (optional)</label>
                                <Textarea
                                    id="notes"
                                    value={transactionNotes}
                                    onChange={(e) => setTransactionNotes(e.target.value)}
                                    placeholder="Add any notes about this decision..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={transactionAction === 'APPROVED' ? 'default' : 'destructive'}
                            onClick={confirmTransactionAction}
                        >
                            {transactionAction === 'APPROVED' ? 'Approve' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
