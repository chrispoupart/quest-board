import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { storeService } from '../services/storeService';
import { StoreItem, StoreTransaction, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface StoreProps {
    user: User;
}

export const Store: React.FC<StoreProps> = ({ user }) => {
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [userPurchases, setUserPurchases] = useState<StoreTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('store');
    const { refreshUser } = useAuth();

    useEffect(() => {
        loadStoreData();
    }, []);

    const loadStoreData = async () => {
        try {
            setLoading(true);
            const [itemsResponse, purchasesResponse] = await Promise.all([
                storeService.getStoreItems(),
                storeService.getPurchaseHistory()
            ]);
            setStoreItems(itemsResponse.items);
            setUserPurchases(purchasesResponse.transactions);
        } catch (error) {
            console.error('Error loading store data:', error);
            toast.error('Failed to load store data');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async (item: StoreItem) => {
        if ((user.bountyBalance || 0) < item.cost) {
            toast.error('Insufficient bounty balance');
            return;
        }

        setSelectedItem(item);
        setPurchaseDialogOpen(true);
    };

    const confirmPurchase = async () => {
        if (!selectedItem) return;

        try {
            setPurchaseLoading(true);
            await storeService.purchaseItem(selectedItem.id);
            toast.success('Purchase request submitted successfully!');
            setPurchaseDialogOpen(false);
            setSelectedItem(null);

            // Refresh user data to update bounty balance
            await refreshUser();

            // Reload store data
            await loadStoreData();
        } catch (error) {
            console.error('Error purchasing item:', error);
            toast.error('Failed to purchase item');
        } finally {
            setPurchaseLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary">Pending</Badge>;
            case 'APPROVED':
                return <Badge variant="default">Approved</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive">Rejected</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
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
                    <p className="mt-2">Loading store...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">🏪 Guild Store</h1>
                <p className="text-gray-600">Exchange your bounty points for rewards!</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <strong>Your Bounty Balance:</strong> {user.bountyBalance || 0} points
                    </p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="store">Store Items</TabsTrigger>
                    <TabsTrigger value="purchases">My Purchases</TabsTrigger>
                </TabsList>

                <TabsContent value="store" className="mt-6">
                    {storeItems.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No store items available at the moment.</p>
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
                                            <Badge variant="outline" className="ml-2">
                                                {item.cost} pts
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div className="text-sm text-gray-500">
                                                Added by {item.creator?.name || 'Unknown'}
                                            </div>
                                            <Button
                                                onClick={() => handlePurchase(item)}
                                                disabled={(user.bountyBalance || 0) < item.cost || purchaseLoading}
                                                className="ml-4"
                                            >
                                                {purchaseLoading ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                    'Purchase'
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="purchases" className="mt-6">
                    {userPurchases.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">You haven't made any purchases yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userPurchases.map((purchase) => (
                                <Card key={purchase.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{purchase.item?.name}</h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {purchase.item?.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm text-gray-500">
                                                        Cost: {purchase.item?.cost} points
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        Purchased: {formatDate(purchase.createdAt)}
                                                    </span>
                                                </div>
                                                {purchase.notes && (
                                                    <p className="text-sm text-gray-600 mt-2">
                                                        <strong>Notes:</strong> {purchase.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                {getStatusBadge(purchase.status)}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Purchase Confirmation Dialog */}
            <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Purchase</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to purchase this item? Your bounty points will be deducted immediately.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="py-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold">{selectedItem.name}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedItem.description || 'No description available'}
                                </p>
                                <div className="mt-2 flex justify-between items-center">
                                    <span className="text-sm">Cost: {selectedItem.cost} points</span>
                                    <span className="text-sm">Your balance: {user.bountyBalance || 0} points</span>
                                </div>
                                <div className="mt-2 text-sm">
                                    <span className="font-medium">Remaining balance after purchase:</span>{' '}
                                    <span className={(user.bountyBalance || 0) - selectedItem.cost < 0 ? 'text-red-600' : 'text-green-600'}>
                                        {(user.bountyBalance || 0) - selectedItem.cost} points
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmPurchase}
                            disabled={purchaseLoading || Boolean(selectedItem && (user.bountyBalance || 0) < selectedItem.cost)}
                        >
                            {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};
