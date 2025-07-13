import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { rewardsService, RewardConfig } from '../../services/rewardsService';
import { toast } from 'sonner';

const RewardManagement: React.FC = () => {
    const [config, setConfig] = useState<RewardConfig>({
        monthlyBountyReward: 0,
        monthlyQuestReward: 0,
        quarterlyCollectiveGoal: 0,
        quarterlyCollectiveReward: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setLoading(true);
                setError(null);
                const configData = await rewardsService.getRewardConfig();
                setConfig(configData);
            } catch (err) {
                console.error('Failed to fetch reward config:', err);
                setError(err instanceof Error ? err.message : 'Failed to load reward configuration');
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            await rewardsService.updateRewardConfig(config);
            toast.success('Reward configuration updated successfully');
        } catch (err) {
            console.error('Failed to update reward config:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update reward configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: keyof RewardConfig, value: string | number) => {
        const isNumberField = ['monthlyBountyReward', 'monthlyQuestReward', 'quarterlyCollectiveGoal'].includes(field as string);

        setConfig(prev => ({
            ...prev,
            [field]: isNumberField ? Number(value) : value
        }));
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Reward Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="space-y-2">
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-10 bg-gray-200 rounded"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Reward Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600">Error loading reward configuration: {error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4"
                    >
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Reward Management</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="monthlyBountyReward">Monthly Bounty Reward ($)</Label>
                            <Input
                                id="monthlyBountyReward"
                                type="number"
                                min="0"
                                step="0.01"
                                value={config.monthlyBountyReward}
                                onChange={(e) => handleInputChange('monthlyBountyReward', e.target.value)}
                                placeholder="0.00"
                            />
                            <p className="text-sm text-gray-500">
                                Monthly reward for highest bounty earner
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="monthlyQuestReward">Monthly Quest Reward ($)</Label>
                            <Input
                                id="monthlyQuestReward"
                                type="number"
                                min="0"
                                step="0.01"
                                value={config.monthlyQuestReward}
                                onChange={(e) => handleInputChange('monthlyQuestReward', e.target.value)}
                                placeholder="0.00"
                            />
                            <p className="text-sm text-gray-500">
                                Monthly reward for most quests completed
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quarterlyCollectiveGoal">Quarterly Collective Goal ($)</Label>
                        <Input
                            id="quarterlyCollectiveGoal"
                            type="number"
                            min="0"
                            step="0.01"
                            value={config.quarterlyCollectiveGoal}
                            onChange={(e) => handleInputChange('quarterlyCollectiveGoal', e.target.value)}
                            placeholder="0.00"
                        />
                        <p className="text-sm text-gray-500">
                            Total bounty goal for the quarter to unlock the collective reward
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quarterlyCollectiveReward">Quarterly Collective Reward</Label>
                        <Textarea
                            id="quarterlyCollectiveReward"
                            value={config.quarterlyCollectiveReward}
                            onChange={(e) => handleInputChange('quarterlyCollectiveReward', e.target.value)}
                            placeholder="e.g., Team Pizza Party, Movie Night, etc."
                            rows={3}
                        />
                        <p className="text-sm text-gray-500">
                            Description of the reward that will be given when the quarterly goal is met
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="min-w-[120px]"
                        >
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default RewardManagement;
