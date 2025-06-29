import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { storeService } from '../../services/storeService';
import { StoreItem, StoreTransaction } from '../../types';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

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
        <div className="container mx-auto p-6 bg-background text-foreground">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🏪 Store Management</h1>
                <p className="text-muted-foreground">Manage store items and approve purchase requests</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted border-border">
                    <TabsTrigger value="items" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Store Items
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        Pending Transactions ({pendingTransactions.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="items" className="mt-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Store Items</h2>
                        <Button onClick={handleCreateItem} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Add New Item
                        </Button>
                    </div>

                    {storeItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No store items available.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {storeItems.map((item) => (
                                <Card key={item.id} className="hover:shadow-lg transition-shadow bg-card border-border">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg text-foreground">{item.name}</CardTitle>
                                                <CardDescription className="mt-2 text-muted-foreground">
                                                    {item.description || 'No description available'}
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="outline" className="border-border text-foreground">{item.cost} pts</Badge>
                                                <Badge variant={item.isActive ? "default" : "secondary"}>
                                                    {item.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-muted-foreground">
                                                Added by {item.creator?.name || 'Unknown'}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditItem(item)}
                                                    className="border-border text-foreground hover:bg-muted"
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
                    <h2 className="text-xl font-semibold mb-6">Pending Transactions</h2>

                    {pendingTransactions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No pending transactions.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pendingTransactions.map((transaction) => (
                                <Card key={transaction.id} className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-foreground">{transaction.item?.name || 'N/A'}</CardTitle>
                                        <CardDescription className="text-muted-foreground">
                                            Requested by {transaction.buyer?.name || 'N/A'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-muted-foreground">
                                                {formatDate(transaction.createdAt)}
                                            </div>
                                            <Badge variant="outline" className="border-border text-foreground">{transaction.item?.cost || 0} pts</Badge>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => handleTransactionAction(transaction, 'APPROVED')}
                                                className="bg-green-600 hover:bg-green-700 text-white"
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
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-foreground">
                                Name
                            </label>
                            <Input
                                id="name"
                                value={itemForm.name}
                                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                                className="col-span-3 bg-background border-border"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="description" className="text-right text-foreground">
                                Description
                            </label>
                            <Textarea
                                id="description"
                                value={itemForm.description}
                                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                                className="col-span-3 bg-background border-border"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="cost" className="text-right text-foreground">
                                Cost
                            </label>
                            <Input
                                id="cost"
                                type="number"
                                value={itemForm.cost}
                                onChange={(e) => setItemForm({ ...itemForm, cost: parseInt(e.target.value) || 0 })}
                                className="col-span-3 bg-background border-border"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="isActive" className="text-right text-foreground">
                                Active
                            </label>
                            <input
                                id="isActive"
                                type="checkbox"
                                checked={itemForm.isActive}
                                onChange={(e) => setItemForm({ ...itemForm, isActive: e.target.checked })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveItem} className="bg-primary hover:bg-primary/90 text-primary-foreground">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Confirm Transaction: {transactionAction === 'APPROVED' ? 'Approve' : 'Reject'}
                        </DialogTitle>
                        <DialogDescription>
                            {transactionAction === 'REJECTED' && 'Please provide a reason for rejection.'}
                        </DialogDescription>
                    </DialogHeader>
                    {transactionAction === 'REJECTED' && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="notes" className="text-right text-foreground">
                                    Notes
                                </label>
                                <Textarea
                                    id="notes"
                                    value={transactionNotes}
                                    onChange={(e) => setTransactionNotes(e.target.value)}
                                    className="col-span-3 bg-background border-border"
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={confirmTransactionAction} className={transactionAction === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}>
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
