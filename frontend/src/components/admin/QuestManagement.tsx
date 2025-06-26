import React, { useState, useEffect } from 'react';
import { questService } from '../../services/questService';
import { Quest, CreateQuestRequest } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    Coins,
    Calendar,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface QuestManagementProps { }

const QuestManagement: React.FC<QuestManagementProps> = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
    const [formData, setFormData] = useState<CreateQuestRequest>({
        title: '',
        description: '',
        bounty: 0,
        isRepeatable: false,
        cooldownDays: undefined
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch all quests for management
    const fetchQuests = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await questService.getQuests();
            setQuests(response.quests);
        } catch (err) {
            console.error('Failed to fetch quests:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch quests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuests();
    }, []);

    const handleCreateQuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || formData.bounty <= 0) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await questService.createQuest(formData);
            setFormData({ title: '', description: '', bounty: 0, isRepeatable: false, cooldownDays: undefined });
            setShowCreateForm(false);
            await fetchQuests();
        } catch (err) {
            console.error('Failed to create quest:', err);
            setError(err instanceof Error ? err.message : 'Failed to create quest');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateQuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingQuest || !formData.title || formData.bounty <= 0) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await questService.updateQuest(editingQuest.id, formData);
            setEditingQuest(null);
            setFormData({ title: '', description: '', bounty: 0, isRepeatable: false, cooldownDays: undefined });
            await fetchQuests();
        } catch (err) {
            console.error('Failed to update quest:', err);
            setError(err instanceof Error ? err.message : 'Failed to update quest');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteQuest = async (questId: number) => {
        if (!window.confirm('Are you sure you want to delete this quest? This action cannot be undone.')) {
            return;
        }

        try {
            setError(null);
            await questService.deleteQuest(questId);
            await fetchQuests();
        } catch (err) {
            console.error('Failed to delete quest:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete quest');
        }
    };

    const handleEditQuest = (quest: Quest) => {
        setEditingQuest(quest);
        setFormData({
            title: quest.title,
            description: quest.description || '',
            bounty: quest.bounty,
            isRepeatable: quest.isRepeatable,
            cooldownDays: quest.cooldownDays
        });
        setShowCreateForm(true);
    };

    const handleCancelEdit = () => {
        setEditingQuest(null);
        setFormData({ title: '', description: '', bounty: 0, isRepeatable: false, cooldownDays: undefined });
        setShowCreateForm(false);
    };

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
            case 'COOLDOWN':
                return 'text-purple-700 bg-purple-100 border-purple-300';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const filteredQuests = quests.filter(quest =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quest.description && quest.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                        <Input
                            placeholder="Search quests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500 min-w-[300px]"
                        />
                    </div>
                </div>

                <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Create New Quest
                </Button>
            </div>

            {/* Create/Edit Quest Form */}
            {showCreateForm && (
                <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg">
                    <CardHeader className="border-b border-amber-200">
                        <CardTitle className="text-amber-900 font-serif">
                            {editingQuest ? 'Edit Quest' : 'Create New Quest'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={editingQuest ? handleUpdateQuest : handleCreateQuest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-amber-900 mb-2">
                                    Quest Title *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter quest title..."
                                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-amber-900 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the quest details..."
                                    className="w-full min-h-[100px] p-3 border border-amber-300 rounded-md focus:border-amber-500 focus:ring-amber-500 focus:ring-1"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-amber-900 mb-2">
                                    Bounty Amount *
                                </label>
                                <Input
                                    type="number"
                                    value={formData.bounty}
                                    onChange={(e) => setFormData({ ...formData, bounty: parseInt(e.target.value) || 0 })}
                                    placeholder="Enter bounty amount..."
                                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isRepeatable"
                                    checked={formData.isRepeatable}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        isRepeatable: e.target.checked,
                                        cooldownDays: e.target.checked ? formData.cooldownDays : undefined
                                    })}
                                    className="w-4 h-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                                />
                                <label htmlFor="isRepeatable" className="text-sm font-medium text-amber-900">
                                    Repeatable Quest
                                </label>
                            </div>

                            {formData.isRepeatable && (
                                <div>
                                    <label className="block text-sm font-medium text-amber-900 mb-2">
                                        Cooldown Period (days) *
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.cooldownDays || ''}
                                        onChange={(e) => setFormData({ ...formData, cooldownDays: parseInt(e.target.value) || undefined })}
                                        placeholder="Enter cooldown days (e.g., 14 for 2 weeks)..."
                                        className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                                        min="1"
                                        required
                                    />
                                    <p className="text-xs text-amber-600 mt-1">
                                        Number of days before this quest can be repeated
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    {editingQuest ? 'Update Quest' : 'Create Quest'}
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    variant="outline"
                                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Quest List */}
            {loading ? (
                <Card className="border-2 border-amber-200 bg-white shadow-md">
                    <CardContent className="p-12 text-center">
                        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-amber-600" />
                        <h3 className="text-xl font-bold text-amber-900 mb-2">Loading Quests</h3>
                        <p className="text-amber-700">Gathering quest information...</p>
                    </CardContent>
                </Card>
            ) : filteredQuests.length === 0 ? (
                <Card className="border-2 border-amber-200 bg-white shadow-md">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                        <h3 className="text-xl font-bold text-amber-900 mb-2">No Quests Found</h3>
                        <p className="text-amber-700">
                            {searchTerm ? 'Try adjusting your search terms.' : 'Create your first quest to get started.'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {filteredQuests.map((quest) => (
                        <Card key={quest.id} className="border-2 border-amber-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-amber-900 mb-2">{quest.title}</h3>
                                        <p className="text-amber-800 mb-3">{quest.description}</p>

                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="flex items-center gap-1 text-amber-700 font-bold">
                                                <Coins className="w-4 h-4" />
                                                <span>{quest.bounty} bounty</span>
                                            </div>

                                            <Badge className={`text-xs font-medium border ${getStatusColor(quest.status)}`}>
                                                {quest.status}
                                            </Badge>

                                            {quest.isRepeatable && (
                                                <Badge className="text-xs font-medium border text-purple-600 bg-purple-50 border-purple-200">
                                                    🔄 Repeatable
                                                </Badge>
                                            )}

                                            <div className="flex items-center gap-1 text-amber-600 text-sm">
                                                <Calendar className="w-4 h-4" />
                                                <span>Created {formatDate(quest.createdAt)}</span>
                                            </div>
                                        </div>

                                        {quest.isRepeatable && quest.cooldownDays && (
                                            <div className="text-sm text-purple-600 bg-purple-50 p-2 rounded mb-3">
                                                <strong>Cooldown:</strong> {quest.cooldownDays} days
                                                {quest.lastCompletedAt && (
                                                    <span className="ml-2">
                                                        • Last completed: {formatDate(quest.lastCompletedAt)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            onClick={() => handleEditQuest(quest)}
                                            variant="outline"
                                            size="sm"
                                            className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>

                                        <Button
                                            onClick={() => handleDeleteQuest(quest.id)}
                                            variant="outline"
                                            size="sm"
                                            className="border-red-300 text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {quest.claimedBy && (
                                    <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                                        Claimed by User #{quest.claimedBy}
                                        {quest.claimedAt && ` on ${formatDate(quest.claimedAt)}`}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestManagement;
