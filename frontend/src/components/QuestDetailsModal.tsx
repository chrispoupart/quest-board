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
                return "text-emerald-600 bg-emerald-50 border-emerald-200";
            case "MEDIUM":
                return "text-amber-600 bg-amber-50 border-amber-200";
            case "HARD":
                return "text-red-600 bg-red-50 border-red-200";
        }
    };

    const getStatusColor = (status: Quest["status"]) => {
        switch (status) {
            case "AVAILABLE":
                return "text-blue-700 bg-blue-100 border-blue-300";
            case "CLAIMED":
                return "text-orange-700 bg-orange-100 border-orange-300";
            case "COMPLETED":
                return "text-purple-700 bg-purple-100 border-purple-300";
            case "APPROVED":
                return "text-green-700 bg-green-100 border-green-300";
            case "REJECTED":
                return "text-red-700 bg-red-100 border-red-300";
            case "COOLDOWN":
                return "text-purple-700 bg-purple-100 border-purple-300";
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                            <Scroll className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-amber-900 font-serif">Quest Details</h2>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Quest Title and Basic Info */}
                    <div>
                        <h3 className="text-xl font-bold text-amber-900 mb-3">{quest.title}</h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className={`text-sm font-medium border ${getDifficultyColor(difficulty)}`}>
                                {difficulty}
                            </Badge>
                            <Badge className={`text-sm font-medium border ${getStatusColor(quest.status)}`}>
                                {quest.status === "COMPLETED" ? "Pending Approval" :
                                    quest.status === "COOLDOWN" ? "On Cooldown" :
                                        quest.status.replace("_", " ")}
                            </Badge>
                            {quest.isRepeatable && (
                                <Badge className="text-sm font-medium border text-purple-600 bg-purple-50 border-purple-200">
                                    🔄 Repeatable
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-amber-700 font-bold mb-4">
                            <div className="flex items-center gap-1">
                                <Coins className="w-5 h-5" />
                                <span className="text-lg">{quest.bounty} Bounty</span>
                            </div>
                        </div>
                    </div>

                    {/* Quest Description */}
                    <div>
                        <h4 className="text-lg font-semibold text-amber-900 mb-2">Quest Requirements</h4>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-amber-800 leading-relaxed whitespace-pre-wrap">
                                {quest.description || "No detailed requirements provided."}
                            </p>
                        </div>
                    </div>

                    {/* Quest Metadata */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-amber-900">Quest Information</h4>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-amber-600" />
                                    <span className="text-amber-700">
                                        <strong>Created by:</strong> {quest.creator?.name || `User ${quest.createdBy}`}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-amber-600" />
                                    <span className="text-amber-700">
                                        <strong>Created:</strong> {formatDate(quest.createdAt)}
                                    </span>
                                </div>

                                {quest.claimedAt && (
                                    <div className="flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-amber-600" />
                                        <span className="text-amber-700">
                                            <strong>Claimed:</strong> {formatDate(quest.claimedAt)}
                                            {quest.claimer?.name && ` by ${quest.claimer.name}`}
                                        </span>
                                    </div>
                                )}

                                {quest.completedAt && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-amber-600" />
                                        <span className="text-amber-700">
                                            <strong>Completed:</strong> {formatDate(quest.completedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Repeatable Quest Information */}
                        {quest.isRepeatable && (
                            <div className="space-y-3">
                                <h4 className="text-lg font-semibold text-purple-900">Repeatable Quest Details</h4>

                                <div className="space-y-2 text-sm">
                                    {quest.cooldownDays && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-purple-600" />
                                            <span className="text-purple-700">
                                                <strong>Cooldown Period:</strong> {formatCooldownPeriod(quest.cooldownDays)}
                                            </span>
                                        </div>
                                    )}

                                    {quest.lastCompletedAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span className="text-purple-700">
                                                <strong>Last Completed:</strong> {formatDate(quest.lastCompletedAt)}
                                            </span>
                                        </div>
                                    )}

                                    {quest.status === 'COOLDOWN' && (
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-600" />
                                            <span className="text-red-600 font-medium">
                                                <strong>Available in:</strong> {getCooldownTimeRemaining(quest)}
                                            </span>
                                        </div>
                                    )}

                                    {quest.status === 'AVAILABLE' && quest.lastCompletedAt && (
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-600" />
                                            <span className="text-green-600 font-medium">
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
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            {quest.status === "AVAILABLE" && (
                                <Button
                                    onClick={() => onAction(quest.id, "claim")}
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium"
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    Accept Quest
                                </Button>
                            )}

                            {quest.status === "COOLDOWN" && (
                                <Button
                                    disabled={true}
                                    className="flex-1 bg-gray-400 text-white font-medium cursor-not-allowed"
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    On Cooldown
                                </Button>
                            )}

                            {quest.status === "CLAIMED" && quest.claimer?.name === currentUser.name && (
                                <Button
                                    onClick={() => onAction(quest.id, "complete")}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                                >
                                    <Trophy className="w-4 h-4 mr-2" />
                                    Report Success
                                </Button>
                            )}

                            {quest.status === "COMPLETED" && currentUser.role !== "PLAYER" && (
                                <div className="flex gap-2 flex-1">
                                    <Button
                                        onClick={() => onAction(quest.id, "approve")}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => onAction(quest.id, "reject")}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            )}

                            {(quest.status === "APPROVED" || quest.status === "REJECTED") && (
                                <div className="flex-1 flex items-center justify-center">
                                    <Badge className={`text-sm font-medium border ${quest.status === "APPROVED"
                                            ? "text-green-600 bg-green-50 border-green-200"
                                            : "text-red-600 bg-red-50 border-red-200"
                                        }`}>
                                        {quest.status === "APPROVED" ? "✓ Completed" : "✗ Rejected"}
                                    </Badge>
                                </div>
                            )}

                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="border-amber-300 text-amber-700 hover:bg-amber-50"
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
