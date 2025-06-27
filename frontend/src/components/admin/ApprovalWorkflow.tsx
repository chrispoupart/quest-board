import React, { useState, useEffect } from 'react';
import { questService } from '../../services/questService';
import { Quest } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    CheckCircle,
    Clock,
    Coins,
    Calendar,
    User,
    AlertCircle,
    Loader2,
    ThumbsUp,
    ThumbsDown
} from 'lucide-react';

interface ApprovalWorkflowProps { }

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = () => {
    const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingQuestId, setProcessingQuestId] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});

    const fetchCompletedQuests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await questService.getQuests({ status: 'COMPLETED' });
            setCompletedQuests(response.quests);
        } catch (err) {
            console.error('Failed to fetch completed quests:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch completed quests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompletedQuests();
    }, []);

    const handleApproveQuest = async (questId: number) => {
        try {
            setProcessingQuestId(questId);
            setError(null);
            await questService.approveQuest(questId);
            await fetchCompletedQuests();
        } catch (err) {
            console.error('Failed to approve quest:', err);
            setError(err instanceof Error ? err.message : 'Failed to approve quest');
        } finally {
            setProcessingQuestId(null);
        }
    };

    const handleRejectQuest = async (questId: number) => {
        const reason = rejectionReason[questId];
        if (!reason || reason.trim() === '') {
            setError('Please provide a reason for rejection');
            return;
        }

        try {
            setProcessingQuestId(questId);
            setError(null);
            await questService.rejectQuest(questId, reason);
            await fetchCompletedQuests();
            setRejectionReason({ ...rejectionReason, [questId]: '' });
        } catch (err) {
            console.error('Failed to reject quest:', err);
            setError(err instanceof Error ? err.message : 'Failed to reject quest');
        } finally {
            setProcessingQuestId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Error Message */}
            {error && (
                <Card className="border-2 border-red-200 bg-red-50 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-amber-200 bg-linear-to-br from-amber-50 to-yellow-50 shadow-lg">
                    <CardContent className="p-6 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-orange-600" />
                        <div className="text-2xl font-bold text-amber-900">
                            {completedQuests.length}
                        </div>
                        <div className="text-sm text-amber-700">Awaiting Approval</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-amber-200 bg-linear-to-br from-amber-50 to-yellow-50 shadow-lg">
                    <CardContent className="p-6 text-center">
                        <Coins className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                        <div className="text-2xl font-bold text-amber-900">
                            {completedQuests.reduce((total, quest) => total + quest.bounty, 0)}
                        </div>
                        <div className="text-sm text-amber-700">Total Pending Bounty</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-amber-200 bg-linear-to-br from-amber-50 to-yellow-50 shadow-lg">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                        <div className="text-2xl font-bold text-amber-900">Ready</div>
                        <div className="text-sm text-amber-700">For Review</div>
                    </CardContent>
                </Card>
            </div>

            {/* Completed Quests for Approval */}
            {loading ? (
                <Card className="border-2 border-amber-200 bg-white shadow-md">
                    <CardContent className="p-12 text-center">
                        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-amber-600" />
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Loading Completed Quests</h3>
                        <p className="text-amber-700">Gathering quests awaiting approval...</p>
                    </CardContent>
                </Card>
            ) : completedQuests.length === 0 ? (
                <Card className="border-2 border-amber-200 bg-white shadow-md">
                    <CardContent className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                        <h3 className="text-xl font-bold text-amber-900 mb-2">All Caught Up!</h3>
                        <p className="text-amber-700">No completed quests are awaiting approval at this time.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="border-2 border-amber-200 bg-white shadow-lg">
                        <CardHeader className="border-b border-amber-200 bg-linear-to-r from-amber-100 to-yellow-100">
                            <CardTitle className="flex items-center gap-2 text-amber-900 font-serif">
                                <Clock className="w-6 h-6" />
                                Quests Awaiting Approval ({completedQuests.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {completedQuests.map((quest) => (
                                    <div key={quest.id} className="border border-amber-200 rounded-lg p-6 bg-linear-to-r from-amber-50 to-yellow-50">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-xl font-bold text-amber-900">{quest.title}</h3>
                                                    <Badge className="text-xs font-medium border text-purple-700 bg-purple-100 border-purple-300">
                                                        COMPLETED
                                                    </Badge>
                                                </div>

                                                <p className="text-amber-800 mb-4">{quest.description}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-amber-700">
                                                            <Coins className="w-4 h-4" />
                                                            <span className="font-semibold">{quest.bounty} bounty</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Created {formatDate(quest.createdAt)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {quest.claimedBy && (
                                                            <div className="flex items-center gap-2 text-amber-700">
                                                                <User className="w-4 h-4" />
                                                                <span>Claimed by User #{quest.claimedBy}</span>
                                                            </div>
                                                        )}

                                                        {quest.completedAt && (
                                                            <div className="flex items-center gap-2 text-amber-600 text-sm">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span>Completed {formatTime(quest.completedAt)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Approval Actions */}
                                        <div className="border-t border-amber-200 pt-4">
                                            <div className="flex flex-col gap-4">
                                                {/* Rejection Reason Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-amber-900 mb-2">
                                                        Rejection Reason (if applicable)
                                                    </label>
                                                    <textarea
                                                        value={rejectionReason[quest.id] || ''}
                                                        onChange={(e) => setRejectionReason({
                                                            ...rejectionReason,
                                                            [quest.id]: e.target.value
                                                        })}
                                                        placeholder="Provide a reason if rejecting this quest..."
                                                        className="w-full p-3 border border-amber-300 rounded-md focus:border-amber-500 focus:ring-amber-500 focus:ring-1 text-sm"
                                                        rows={2}
                                                    />
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={() => handleApproveQuest(quest.id)}
                                                        disabled={processingQuestId === quest.id}
                                                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                                                    >
                                                        {processingQuestId === quest.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <ThumbsUp className="w-4 h-4" />
                                                        )}
                                                        Approve Quest
                                                    </Button>

                                                    <Button
                                                        onClick={() => handleRejectQuest(quest.id)}
                                                        disabled={processingQuestId === quest.id}
                                                        variant="outline"
                                                        className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        {processingQuestId === quest.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <ThumbsDown className="w-4 h-4" />
                                                        )}
                                                        Reject Quest
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ApprovalWorkflow;
