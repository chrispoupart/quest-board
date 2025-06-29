import React from 'react';
import { X, Coins, Clock, Scroll, Shield, Trophy, Check, User, Calendar, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Quest } from '../types';

interface QuestDetailsModalProps {
    quest: Quest | null;
    isOpen: boolean;
    onClose: () => void;
    onAction?: (questId: number, action: string) => Promise<void>;
    currentUser?: {
        name: string;
        role: string;
    };
}

const QuestDetailsModal: React.FC<QuestDetailsModalProps> = ({
    quest,
    isOpen,
    onClose,
    onAction,
    currentUser
}) => {
    if (!isOpen || !quest) return null;

    const getDifficultyFromBounty = (bounty: number): "EASY" | "MEDIUM" | "HARD" => {
        if (bounty <= 15) return "EASY";
        if (bounty <= 30) return "MEDIUM";
        return "HARD";
    };

    const getDifficultyColor = (difficulty: "EASY" | "MEDIUM" | "HARD") => {
        switch (difficulty) {
            case "EASY":
            return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700";
            case "MEDIUM":
            return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700";
            case "HARD":
            return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700";
        }
    };

    const getStatusColor = (status: Quest["status"]) => {
        switch (status) {
            case "AVAILABLE":
            return "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700";
            case "CLAIMED":
            return "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700";
            case "COMPLETED":
            return "text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700";
            case "APPROVED":
            return "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700";
            case "REJECTED":
            return "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700";
            case "COOLDOWN":
            return "text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700";
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCooldownPeriod = (cooldownDays: number): string => {
        if (cooldownDays === 1) return "1 day";
        if (cooldownDays < 7) return `${cooldownDays} days`;
        if (cooldownDays === 7) return "1 week";
        if (cooldownDays < 14) return `${cooldownDays} days`;
        if (cooldownDays === 14) return "2 weeks";
        if (cooldownDays < 30) return `${cooldownDays} days`;
        if (cooldownDays === 30) return "1 month";
        return `${cooldownDays} days`;
    };

    const getCooldownTimeRemaining = (quest: Quest): string | null => {
        if (quest.status !== 'COOLDOWN' || !quest.lastCompletedAt || !quest.cooldownDays) {
            return null;
        }

        const lastCompleted = new Date(quest.lastCompletedAt);
        const cooldownEnd = new Date(lastCompleted.getTime() + quest.cooldownDays * 24 * 60 * 60 * 1000);
        const now = new Date();
        const remaining = cooldownEnd.getTime() - now.getTime();

        if (remaining <= 0) return null;

        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };

    const difficulty = getDifficultyFromBounty(quest.bounty);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"> {/* Use Tailwind's opacity shorthand */}
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <Scroll className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground font-serif">Quest Details</h2>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Quest Title and Basic Info */}
                    <div>
                        <h3 className="text-xl font-bold text-foreground mb-3">{quest.title}</h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={`text-sm font-medium border ${getDifficultyColor(difficulty)}`}>
                                {difficulty}
                            </Badge>
                            <Badge className={`text-sm font-medium border ${getStatusColor(quest.status)}`}>
                                {quest.status === "COMPLETED" ? "Pending Approval" :
                                    quest.status === "COOLDOWN" ? "On Cooldown" :
                                        (quest as any)._displayStatus === 'COMPLETED_REPEATABLE' ? "Completed" :
                                            (quest as any)._displayStatus === 'COMPLETED_HISTORY' ? "Completed" :
                                                quest.status.replace("_", " ")}
                            </Badge>
                            {quest.isRepeatable && (
                                <Badge className="text-sm font-medium border text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700">
                                    🔄 Repeatable
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-primary font-bold mb-4">
                            <div className="flex items-center gap-1">
                                <Coins className="w-5 h-5" />
                                <span className="text-lg">{quest.bounty} Bounty</span>
                            </div>
                        </div>
                    </div>

                    {/* Quest Description */}
                    <div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">Quest Requirements</h4>
                        <div className="bg-muted border border-border rounded-lg p-4">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {quest.description || "No detailed requirements provided."}
                            </p>
                        </div>
                    </div>

                    {/* Quest Metadata */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-foreground">Quest Information</h4>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground">
                                        <strong>Created by:</strong> {quest.creator?.name || `User ${quest.createdBy}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground">
                                        <strong>Created:</strong> {formatDate(quest.createdAt)}
                                    </span>
                                </div>

                                {quest.claimedAt && (
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">
                                            <strong>Claimed:</strong> {formatDate(quest.claimedAt)}
                                            {quest.claimer?.name && ` by ${quest.claimer.name}`}
                                        </span>
                                    </div>
                                )}

                                {quest.completedAt && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">
                                            <strong>Completed:</strong> {formatDate(quest.completedAt)}
                                        </span>
                                    </div>
                                )}

                                {/* Handle repeatable quests that have been reset but were completed */}
                                {(quest as any)._completionDate && !quest.completedAt && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">
                                            <strong>Completed:</strong> {formatDate((quest as any)._completionDate)}
                                        </span>
                                    </div>
                                )}

                                {/* Handle quests from completion history */}
                                {(quest as any)._displayStatus === 'COMPLETED_HISTORY' && (quest as any)._completionDate && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">
                                            <strong>Completed:</strong> {formatDate((quest as any)._completionDate)}
                                        </span>
                                    </div>
                                )}

                                {(quest as any)._displayStatus === 'COMPLETED_HISTORY' && (quest as any)._approvedAt && (
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-primary" />
                                        <span className="text-muted-foreground">
                                            <strong>{(quest as any)._approvalStatus === 'APPROVED' ? 'Approved' : 'Rejected'}:</strong> {formatDate((quest as any)._approvedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Repeatable Quest Information */}
                        {quest.isRepeatable && (
                            <div className="space-y-3">
                                <h4 className="text-lg font-semibold text-foreground">Repeatable Quest Details</h4>

                                <div className="space-y-2 text-sm">
                                    {quest.cooldownDays && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            <span className="text-muted-foreground">
                                                <strong>Cooldown Period:</strong> {formatCooldownPeriod(quest.cooldownDays)}
                                            </span>
                                        </div>
                                    )}

                                    {quest.lastCompletedAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            <span className="text-muted-foreground">
                                                <strong>Last Completed:</strong> {formatDate(quest.lastCompletedAt)}
                                            </span>
                                        </div>
                                    )}

                                    {quest.status === 'COOLDOWN' && (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                            <span className="text-red-600 dark:text-red-400 font-medium">
                                                <strong>Available in:</strong> {getCooldownTimeRemaining(quest)}
                                            </span>
                                        </div>
                                    )}

                                    {quest.status === 'AVAILABLE' && quest.lastCompletedAt && (
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                                            <span className="text-green-600 dark:text-green-400 font-medium">
                                                <strong>Status:</strong> Ready to repeat!
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {onAction && currentUser && (
                        <div className="flex gap-3 pt-4 border-t border-border">
                            {quest.status === "AVAILABLE" && (
                                <Button
                                    onClick={() => onAction(quest.id, "claim")}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Accept Quest
                                </Button>
                            )}

                            {quest.status === "COOLDOWN" && (
                                <Button
                                    disabled={true}
                                    className="flex-1 bg-muted text-muted-foreground font-medium cursor-not-allowed"
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    On Cooldown
                                </Button>
                            )}

                            {quest.status === "CLAIMED" && quest.claimer?.name === currentUser.name && (
                                <Button
                                    onClick={() => onAction(quest.id, "complete")}
                                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white dark:text-green-100 font-medium"
                                >
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Report Success
                                </Button>
                            )}

                            {quest.status === "COMPLETED" && currentUser.role !== "PLAYER" && (
                                <div className="flex gap-2 flex-1">
                                    <Button
                                        onClick={() => onAction(quest.id, "approve")}
                                        className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white dark:text-green-100 font-medium"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => onAction(quest.id, "reject")}
                                        className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white dark:text-red-100 font-medium"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {(quest.status === "APPROVED" || quest.status === "REJECTED") && (
                                <div className="flex-1 flex items-center justify-center">
                                    <Badge className={`text-sm font-medium border ${quest.status === "APPROVED"
                                            ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                                            : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700"
                                        }`}>
                                        {quest.status === "APPROVED" ? "✓ Completed" : "✗ Rejected"}
                                    </Badge>
                                </div>
                            )}

                            {(quest as any)._displayStatus === 'COMPLETED_HISTORY' && (
                                <div className="flex-1 flex items-center justify-center">
                                    <Badge className={`text-sm font-medium border ${(quest as any)._approvalStatus === "APPROVED"
                                            ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
                                            : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700"
                                        }`}>
                                        {(quest as any)._approvalStatus === "APPROVED" ? "✓ Completed" : "✗ Rejected"}
                                    </Badge>
                                </div>
                            )}

                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="border-border text-muted-foreground hover:bg-muted"
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestDetailsModal;
