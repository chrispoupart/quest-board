import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coins, Store as StoreIcon } from 'lucide-react';
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
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-foreground">Loading store...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <StoreIcon className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground font-serif">Guild Store</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Spend your hard-earned points on exclusive items and upgrades
                    </p>
                    <div className="mt-4 p-4 bg-muted rounded-lg border-2 border-border max-w-md mx-auto">
                        <p className="text-sm text-foreground font-medium">
                            Your Balance: <span className="text-primary font-bold">{user?.bountyBalance || 0} points</span>
                        </p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted border border-border">
                        <TabsTrigger
                            value="store"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                        >
                            Store Items
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                        >
                            Purchase History
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="store" className="mt-6">
                        {storeItems.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No store items available at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {storeItems.map((item) => (
                                    <Card key={item.id} className="hover:shadow-lg transition-shadow border-2 border-border bg-card">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg font-bold text-foreground">{item.name}</CardTitle>
                                                <Badge className="bg-primary text-primary-foreground">
                                                    <Coins className="w-3 h-3 mr-1" />
                                                    {item.cost}
                                                </Badge>
                                            </div>
                                            {item.description && (
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            )}
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                onClick={() => handlePurchase(item)}
                                                disabled={!user || (user.bountyBalance || 0) < item.cost}
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                            >
                                                {!user ? 'Login Required' :
                                                 (user.bountyBalance || 0) < item.cost ? 'Insufficient Points' : 'Purchase'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        {userPurchases.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">You haven't made any purchases yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {userPurchases.map((purchase) => (
                                    <Card key={purchase.id} className="border-2 border-border bg-card">
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-foreground">{purchase.item?.name}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {purchase.item?.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            Cost: {purchase.item?.cost} points
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            Purchased: {formatDate(purchase.createdAt)}
                                                        </span>
                                                    </div>
                                                    {purchase.notes && (
                                                        <p className="text-sm text-muted-foreground mt-2">
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
                                <div className="bg-muted p-4 rounded-lg border-2 border-border">
                                    <h3 className="font-semibold text-foreground">{selectedItem.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {selectedItem.description || 'No description available'}
                                    </p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Cost: {selectedItem.cost} points</span>
                                        <span className="text-sm text-muted-foreground">Your balance: {user?.bountyBalance || 0} points</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setPurchaseDialogOpen(false)}
                                className="border-border text-muted-foreground hover:bg-muted"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={confirmPurchase}
                                disabled={purchaseLoading || !user || (user.bountyBalance || 0) < (selectedItem?.cost || 0)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {purchaseLoading ? 'Processing...' : 'Confirm Purchase'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
