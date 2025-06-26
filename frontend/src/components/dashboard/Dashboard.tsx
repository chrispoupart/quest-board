import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { DashboardData } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
    Trophy,
    Coins,
    Shield,
    Scroll,
    Clock,
    Star,
    Sword,
    Crown,
    MapPin,
    TrendingUp,
    Calendar,
    AlertCircle,
    Eye
} from 'lucide-react';

interface DashboardProps { }

const Dashboard: React.FC<DashboardProps> = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await dashboardService.getUserDashboard();
                setDashboardData(data);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'text-blue-700 bg-blue-100 border-blue-300';
            case 'CLAIMED':
                return 'text-orange-700 bg-orange-100 border-orange-300';
            case 'COMPLETED':
                return 'text-purple-700 bg-purple-100 border-purple-300';
            case 'APPROVED':
                return 'text-green-700 bg-green-100 border-green-300';
            case 'REJECTED':
                return 'text-red-700 bg-red-100 border-red-300';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    const getRoleTitle = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Guild Master';
            case 'EDITOR':
                return 'Quest Giver';
            case 'PLAYER':
                return 'Adventurer';
            default:
                return 'Citizen';
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        return `${Math.floor(diffInDays / 30)} months ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">Loading Your Chronicles</h3>
                    <p className="text-amber-700">Gathering your adventure records...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
                <Card className="border-2 border-red-200 bg-red-50 shadow-lg max-w-md">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-red-900 mb-2">Unable to Load Dashboard</h3>
                        <p className="text-red-700 mb-4">{error}</p>
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!dashboardData || !user) {
        return null;
    }

    const { stats, currentQuests, recentCreatedQuests } = dashboardData;

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-amber-900 font-serif">Adventurer's Chronicle</h1>
                    </div>
                    <p className="text-amber-700 text-lg">
                        Welcome back, <span className="font-semibold">{getRoleTitle(user.role)} {user.name}</span>
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                            <div className="text-3xl font-bold text-amber-900">{stats.completedQuests}</div>
                            <div className="text-sm text-amber-700">Completed Quests</div>
                            <div className="text-xs text-amber-600 mt-1">Glory earned</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <Coins className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                            <div className="text-3xl font-bold text-amber-900">{stats.totalBounty}</div>
                            <div className="text-sm text-amber-700">Total Bounty</div>
                            <div className="text-xs text-amber-600 mt-1">Gold earned</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <Shield className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                            <div className="text-3xl font-bold text-amber-900">{stats.currentQuests}</div>
                            <div className="text-sm text-amber-700">Active Quests</div>
                            <div className="text-xs text-amber-600 mt-1">In progress</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-6 text-center">
                            <Scroll className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                            <div className="text-3xl font-bold text-amber-900">{stats.totalQuests}</div>
                            <div className="text-sm text-amber-700">Quests Created</div>
                            <div className="text-xs text-amber-600 mt-1">Leadership</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Current Active Quests */}
                    <Card className="border-2 border-amber-200 bg-white shadow-lg">
                        <CardHeader className="border-b border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100">
                            <CardTitle className="flex items-center gap-2 text-amber-900 font-serif">
                                <Sword className="w-6 h-6" />
                                Active Adventures
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {currentQuests.length === 0 ? (
                                <div className="text-center py-8">
                                    <MapPin className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                                    <h3 className="text-lg font-semibold text-amber-900 mb-2">No Active Quests</h3>
                                    <p className="text-amber-700 mb-4">Ready for your next adventure?</p>
                                    <Button
                                        onClick={() => window.location.href = '/quests'}
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                    >
                                        <Sword className="w-4 h-4 mr-2" />
                                        Find Quests
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {currentQuests.map((quest) => (
                                        <div key={quest.id} className="border border-amber-200 rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-amber-900 leading-tight">{quest.title}</h3>
                                                <div className="flex items-center gap-1 text-amber-700 font-bold">
                                                    <Coins className="w-4 h-4" />
                                                    <span>{quest.bounty}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-amber-800 mb-3 line-clamp-2">{quest.description}</p>
                                            <div className="flex items-center justify-between">
                                                <Badge className={`text-xs font-medium border ${getStatusColor(quest.status)}`}>
                                                    {quest.status.replace('_', ' ')}
                                                </Badge>
                                                <div className="flex items-center gap-2 text-xs text-amber-600">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Claimed {formatTimeAgo(quest.claimedAt || quest.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {currentQuests.length > 0 && (
                                        <Button
                                            onClick={() => window.location.href = '/quests?tab=claimed'}
                                            variant="outline"
                                            className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View All Active Quests
                                        </Button>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Created Quests */}
                    <Card className="border-2 border-amber-200 bg-white shadow-lg">
                        <CardHeader className="border-b border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100">
                            <CardTitle className="flex items-center gap-2 text-amber-900 font-serif">
                                <Star className="w-6 h-6" />
                                {user.role === 'PLAYER' ? 'Quest History' : 'Recent Creations'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {recentCreatedQuests.length === 0 ? (
                                <div className="text-center py-8">
                                    <Scroll className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                                        {user.role === 'PLAYER' ? 'No Quest History' : 'No Quests Created'}
                                    </h3>
                                    <p className="text-amber-700 mb-4">
                                        {user.role === 'PLAYER'
                                            ? 'Start your adventure by claiming a quest!'
                                            : 'Ready to create your first quest?'}
                                    </p>
                                    {(user.role === 'ADMIN' || user.role === 'EDITOR') && (
                                        <Button
                                            onClick={() => window.location.href = '/admin'}
                                            className="bg-amber-600 hover:bg-amber-700 text-white"
                                        >
                                            <Star className="w-4 h-4 mr-2" />
                                            Create Quest
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentCreatedQuests.map((quest) => (
                                        <div key={quest.id} className="border border-amber-200 rounded-lg p-4 bg-gradient-to-r from-amber-50 to-yellow-50">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-amber-900 leading-tight">{quest.title}</h3>
                                                <div className="flex items-center gap-1 text-amber-700 font-bold">
                                                    <Coins className="w-4 h-4" />
                                                    <span>{quest.bounty}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-amber-800 mb-3 line-clamp-2">{quest.description}</p>
                                            <div className="flex items-center justify-between">
                                                <Badge className={`text-xs font-medium border ${getStatusColor(quest.status)}`}>
                                                    {quest.status.replace('_', ' ')}
                                                </Badge>
                                                <div className="flex items-center gap-2 text-xs text-amber-600">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>Created {formatTimeAgo(quest.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={() => window.location.href = '/quests'}
                                        variant="outline"
                                        className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                                    >
                                        <Scroll className="w-4 h-4 mr-2" />
                                        View All Quests
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-100 to-yellow-100 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-amber-900 font-serif">
                                <TrendingUp className="w-6 h-6" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                    onClick={() => window.location.href = '/quests'}
                                    className="fantasy-button flex items-center justify-center gap-2 h-12"
                                >
                                    <Sword className="w-5 h-5" />
                                    Browse Quests
                                </Button>

                                {(user.role === 'ADMIN' || user.role === 'EDITOR') && (
                                    <Button
                                        onClick={() => window.location.href = '/admin'}
                                        className="fantasy-button flex items-center justify-center gap-2 h-12"
                                    >
                                        <Star className="w-5 h-5" />
                                        Create Quest
                                    </Button>
                                )}

                                <Button
                                    onClick={() => window.location.href = '/profile'}
                                    variant="outline"
                                    className="border-amber-300 text-amber-700 hover:bg-amber-50 flex items-center justify-center gap-2 h-12"
                                >
                                    <Shield className="w-5 h-5" />
                                    Character Sheet
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
