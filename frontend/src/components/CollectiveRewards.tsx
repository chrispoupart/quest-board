import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { rewardsService, CollectiveProgress } from '../services/rewardsService';
import { useAuth } from '../contexts/AuthContext';

const CollectiveRewards: React.FC = () => {
    const [progress, setProgress] = useState<CollectiveProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                setLoading(true);
                setError(null);
                const currentQuarter = rewardsService.getCurrentQuarter();
                const progressData = await rewardsService.getCollectiveProgress(currentQuarter);
                setProgress(progressData);
            } catch (err) {
                console.error('Failed to fetch collective progress:', err);
                setError(err instanceof Error ? err.message : 'Failed to load collective progress');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProgress();
        }
    }, [user]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Collective Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Collective Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-red-600 text-sm">Error loading collective rewards: {error}</p>
                </CardContent>
            </Card>
        );
    }

    if (!progress || progress.goal === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Collective Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 text-sm">No collective goal set for this quarter.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Collective Rewards</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-1">{progress.reward}</h3>
                        <p className="text-sm text-gray-600">Quarterly Goal</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span className="font-medium">
                                ${progress.progress.toFixed(2)} / ${progress.goal.toFixed(2)}
                            </span>
                        </div>
                        <Progress value={Math.min(progress.percent, 100)} className="h-2" />
                        <p className="text-xs text-gray-500 text-center">
                            {progress.percent.toFixed(1)}% complete
                        </p>
                    </div>

                    {progress.percent >= 100 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-green-800 text-sm font-medium">
                                🎉 Goal achieved! The reward will be distributed soon.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default CollectiveRewards;
