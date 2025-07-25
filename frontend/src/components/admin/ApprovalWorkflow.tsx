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
            const response = await questService.getQuests({ status: 'PENDING_APPROVAL' });
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
                <Card className="border-2 border-destructive bg-destructive/10 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardContent className="p-6 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <div className="text-2xl font-bold text-foreground">
                            {completedQuests.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Awaiting Approval</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardContent className="p-6 text-center">
                        <Coins className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <div className="text-2xl font-bold text-foreground">
                            {completedQuests.reduce((total, quest) => total + quest.bounty, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Pending Bounty</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <div className="text-2xl font-bold text-foreground">Ready</div>
                        <div className="text-sm text-muted-foreground">For Review</div>
                    </CardContent>
                </Card>
            </div>

            {/* Completed Quests for Approval */}
            {loading ? (
                <Card className="border-2 border-border bg-card shadow-md">
                    <CardContent className="p-12 text-center">
                        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Loading Completed Quests</h3>
                        <p className="text-muted-foreground">Gathering quests awaiting approval...</p>
                    </CardContent>
                </Card>
            ) : completedQuests.length === 0 ? (
                <Card className="border-2 border-border bg-card shadow-md">
                    <CardContent className="p-12 text-center">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h3>
                        <p className="text-muted-foreground">No completed quests are awaiting approval at this time.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <Card className="border-2 border-border bg-card shadow-lg">
                        <CardHeader className="border-b border-border bg-muted/40">
                            <CardTitle className="flex items-center gap-2 text-foreground font-serif">
                                <Clock className="w-6 h-6" />
                                Quests Awaiting Approval ({completedQuests.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {completedQuests.map((quest) => (
                                    <div key={quest.id} className="border border-border rounded-lg p-6 bg-background">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h3 className="text-xl font-bold text-foreground">{quest.title}</h3>
                                                    <Badge className="text-xs font-medium border text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700">
                                                        COMPLETED
                                                    </Badge>
                                                </div>

                                                <p className="text-muted-foreground mb-4">{quest.description}</p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-foreground">
                                                            <Coins className="w-4 h-4" />
                                                            <span className="font-semibold">{quest.bounty} bounty</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>Created {formatDate(quest.createdAt)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {quest.claimedBy && (
                                                            <div className="flex items-center gap-2 text-foreground">
                                                                <User className="w-4 h-4" />
                                                                {quest.claimer ? (
                                                                    <>
                                                                        {quest.claimer.avatarUrl && (
                                                                            <img src={quest.claimer.avatarUrl} alt={quest.claimer.characterName || quest.claimer.name} className="w-5 h-5 rounded-full inline-block mr-1" />
                                                                        )}
                                                                        <span>{quest.claimer.characterName || quest.claimer.name || `User #${quest.claimer.id}`}</span>
                                                                    </>
                                                                ) : (
                                                                    <span>User #{quest.claimedBy}</span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {quest.completedAt && (
                                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span>Completed {formatTime(quest.completedAt)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Approval Actions */}
                                        <div className="border-t border-border pt-4">
                                            <div className="flex flex-col gap-4">
                                                {/* Rejection Reason Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">
                                                        Rejection Reason (if applicable)
                                                    </label>
                                                    <textarea
                                                        value={rejectionReason[quest.id] || ''}
                                                        onChange={(e) => setRejectionReason({
                                                            ...rejectionReason,
                                                            [quest.id]: e.target.value
                                                        })}
                                                        placeholder="Provide a reason if rejecting this quest..."
                                                        className="w-full p-3 border border-border rounded-md bg-background focus:border-primary focus:ring-primary focus:ring-1 text-sm"
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
                                                        variant="destructive"
                                                        className="flex items-center gap-2"
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
