import React, { useState, useEffect } from 'react';
import { questService } from '../../services/questService';
import { skillService } from '../../services/skillService';
import { userService } from '../../services/userService';
import { Quest, CreateQuestRequest, Skill, CreateQuestRequiredSkillRequest, User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import {
    Plus,
    Pencil,
    Search,
    Coins,
    Calendar,
    AlertCircle,
    Loader2,
    Trash2
} from 'lucide-react';
import { Pagination } from '../ui/pagination';
import QuestEditModal from '../QuestEditModal';

interface QuestManagementProps { }

const QuestManagement: React.FC<QuestManagementProps> = () => {
    const { user, isAuthenticated } = useAuth();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
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
    const [skillRequirements, setSkillRequirements] = useState<CreateQuestRequiredSkillRequest[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [assignedUserId, setAssignedUserId] = useState<number | undefined>(undefined);
    const [cloneModalOpen, setCloneModalOpen] = useState<{ open: boolean, quest: Quest | null }>({ open: false, quest: null });

    // Fetch all quests and skills for management
    const fetchData = async (page: number = 1) => {
        if (!isAuthenticated || !user) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const params = {
                limit: 20,
                page,
                ...(searchTerm && { search: searchTerm })
            };
            const [questsResponse, skillsResponse] = await Promise.all([
                questService.getQuests(params),
                skillService.getAllSkills()
            ]);
            setQuests(questsResponse.quests);
            setSkills(skillsResponse);
            setTotalPages(questsResponse.pagination.totalPages);
            setCurrentPage(page);
        } catch (err) {
            console.error('QuestManagement: Failed to fetch data:', err);
            if (err instanceof Error && err.message.includes('401')) {
                console.error('QuestManagement: 401 error - token might be expired or invalid');
                setError('Authentication expired. Please log in again.');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchData(1);
        }
    }, [isAuthenticated, user]);

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Fetch all users when showing the create form
    useEffect(() => {
        if (showCreateForm) {
            userService.getAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
        }
    }, [showCreateForm]);

    const handleCreateQuest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || formData.bounty <= 0) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            // Use atomic operation to create quest with skill requirements
            await questService.createQuestWithSkills({
                ...formData,
                userId: assignedUserId ?? undefined,
                skillRequirements: skillRequirements.length > 0 ? skillRequirements : undefined
            });

            setFormData({ title: '', description: '', bounty: 0, isRepeatable: false, cooldownDays: undefined });
            setSkillRequirements([]);
            setAssignedUserId(undefined);
            setShowCreateForm(false);
            await fetchData(currentPage);
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

            // Use atomic operation to update quest with skill requirements
            await questService.updateQuestWithSkills(editingQuest.id, {
                ...formData,
                userId: assignedUserId ?? null,
                skillRequirements: skillRequirements.length > 0 ? skillRequirements : undefined
            });

            setEditingQuest(null);
            setFormData({ title: '', description: '', bounty: 0, isRepeatable: false, cooldownDays: undefined });
            setSkillRequirements([]);
            await fetchData(currentPage);
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
            await fetchData(currentPage);
        } catch (err) {
            console.error('Failed to delete quest:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete quest');
        }
    };

    const handleEditQuest = async (quest: Quest) => {
        setEditingQuest(quest);
        setFormData({
            title: quest.title,
            description: quest.description || '',
            bounty: quest.bounty,
            isRepeatable: quest.isRepeatable,
            cooldownDays: quest.cooldownDays
        });
        setAssignedUserId((quest as any).userId ?? undefined);

        // Load existing skill requirements
        try {
            const existingSkills = await skillService.getQuestRequiredSkills(quest.id);
            setSkillRequirements(existingSkills.map(skill => ({
                skillId: skill.skillId,
                minLevel: skill.minLevel
            })));
        } catch (error) {
            console.warn('Failed to load skill requirements:', error);
            setSkillRequirements([]);
        }

        setShowCreateForm(true);
    };

    const handleCancelEdit = () => {
        setEditingQuest(null);
        setFormData({ title: '', description: '', bounty: 0, isRepeatable: false, cooldownDays: undefined });
        setSkillRequirements([]);
        setAssignedUserId(undefined);
        setShowCreateForm(false);
    };

    const addSkillRequirement = () => {
        setSkillRequirements([...skillRequirements, { skillId: 0, minLevel: 1 }]);
    };

    const removeSkillRequirement = (index: number) => {
        setSkillRequirements(skillRequirements.filter((_, i) => i !== index));
    };

    const updateSkillRequirement = (index: number, field: 'skillId' | 'minLevel', value: number) => {
        const updated = [...skillRequirements];
        updated[index] = { ...updated[index], [field]: value };
        setSkillRequirements(updated);
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

    const handlePageChange = (page: number) => {
        fetchData(page);
    };

    return (
        <div className="space-y-6">
            {/* Error Message */}
            {error && (
                <Card className="border-2 border-destructive bg-destructive/10 shadow-md">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-destructive">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Error: {error}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search quests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background border-border"
                    />
                </div>
                <Button
                    onClick={() => {
                        setShowCreateForm(true);
                        setEditingQuest(null);
                        setFormData({ title: '', description: '', bounty: 0, isRepeatable: false });
                        setSkillRequirements([]);
                    }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Quest
                </Button>
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-serif text-foreground">
                            {editingQuest ? 'Edit Quest' : 'Create New Quest'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={editingQuest ? handleUpdateQuest : handleCreateQuest} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="title" className="font-medium text-foreground">Title *</label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="E.g., The Lost Artifact of Eldoria"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="bounty" className="font-medium text-foreground">Bounty *</label>
                                    <Input
                                        id="bounty"
                                        type="number"
                                        value={formData.bounty}
                                        onChange={(e) => setFormData({ ...formData, bounty: Number(e.target.value) })}
                                        placeholder="E.g., 100"
                                        required
                                        className="bg-background border-border"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="font-medium text-foreground">Description</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the quest in detail..."
                                    className="w-full p-2 border rounded-md bg-background border-border min-h-[100px]"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isRepeatable"
                                        checked={formData.isRepeatable}
                                        onChange={(e) => setFormData({ ...formData, isRepeatable: e.target.checked })}
                                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isRepeatable" className="font-medium text-foreground">Is Repeatable?</label>
                                </div>

                                {formData.isRepeatable && (
                                    <div className="space-y-2 flex-1">
                                        <label htmlFor="cooldownDays" className="font-medium text-foreground">Cooldown (Days)</label>
                                        <Input
                                            id="cooldownDays"
                                            type="number"
                                            value={formData.cooldownDays}
                                            onChange={(e) => setFormData({ ...formData, cooldownDays: Number(e.target.value) || undefined })}
                                            placeholder="E.g., 7"
                                            className="bg-background border-border"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-medium text-foreground">Skill Requirements</h3>
                                {skillRequirements.map((req, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-background border-border">
                                        <select
                                            value={req.skillId}
                                            onChange={(e) => updateSkillRequirement(index, 'skillId', Number(e.target.value))}
                                            className="p-2 border rounded-md bg-background border-border"
                                        >
                                            <option value={0} disabled>Select a skill</option>
                                            {skills.map(skill => (
                                                <option key={skill.id} value={skill.id}>{skill.name}</option>
                                            ))}
                                        </select>
                                        <Input
                                            type="number"
                                            value={req.minLevel}
                                            onChange={(e) => updateSkillRequirement(index, 'minLevel', Number(e.target.value))}
                                            placeholder="Min Level"
                                            className="w-32 bg-background border-border"
                                        />
                                        <Button type="button" variant="destructive" onClick={() => removeSkillRequirement(index)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={addSkillRequirement}>
                                    Add Skill Requirement
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="assignUser" className="font-medium text-foreground">Assign to User (optional)</label>
                                <select
                                    id="assignUser"
                                    value={assignedUserId ?? ''}
                                    onChange={e => setAssignedUserId(e.target.value ? Number(e.target.value) : undefined)}
                                    className="p-2 border rounded-md bg-background border-border w-full"
                                >
                                    <option value="">None (Global Quest)</option>
                                    {allUsers.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                                    Cancel
                                </Button>
                                {editingQuest && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setCloneModalOpen({ open: true, quest: editingQuest });
                                        }}
                                    >
                                        Clone Quest
                                    </Button>
                                )}
                                <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                    {submitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingQuest ? 'Save Changes' : 'Create Quest'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Quests List */}
            {loading ? (
                <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                    <p className="mt-2 text-muted-foreground">Loading quests...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {quests.map((quest) => {
                        const assignedUser = (quest as any).user || (quest as any).assignedUser;
                        const assignedUserId = (quest as any).userId;
                        const claimer = (quest as any).claimer;
                        const claimedById = (quest as any).claimedBy;
                        return (
                            <Card key={quest.id} className="border-2 border-border bg-card shadow-md">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-foreground text-lg">{quest.title}</h3>
                                        <p className="text-sm text-muted-foreground">{quest.description}</p>
                                        {/* Claimer info for everyone */}
                                        {(claimer || claimedById) && (
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span className="font-medium">Claimed by:</span>
                                                {claimer ? (
                                                    <>
                                                        {claimer.avatarUrl && (
                                                            <img src={claimer.avatarUrl} alt={claimer.name} className="w-5 h-5 rounded-full inline-block mr-1" />
                                                        )}
                                                        <span>{claimer.name || claimer.email || `User #${claimer.id}`}</span>
                                                    </>
                                                ) : (
                                                    <span>User #{claimedById}</span>
                                                )}
                                            </div>
                                        )}
                                        {/* Assigned user info for permitted users */}
                                        {(user?.role === 'ADMIN' || user?.role === 'EDITOR') && (assignedUser || assignedUserId) && (
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span className="font-medium">Assigned to:</span>
                                                {assignedUser ? (
                                                    <>
                                                        {assignedUser.avatarUrl && (
                                                            <img src={assignedUser.avatarUrl} alt={assignedUser.name} className="w-5 h-5 rounded-full inline-block mr-1" />
                                                        )}
                                                        <span>{assignedUser.name || assignedUser.email || `User #${assignedUser.id}`}</span>
                                                    </>
                                                ) : (
                                                    <span>User #{assignedUserId}</span>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                            <div className="flex items-center gap-1">
                                                <Coins className="w-3 h-3" />
                                                <span>{quest.bounty} Bounty</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Created: {formatDate(quest.createdAt)}</span>
                                            </div>
                                            <Badge className={`text-xs font-medium border ${getStatusColor(quest.status)}`}>
                                                {quest.status.replace('_', ' ')}
                                            </Badge>
                                            {quest.isRepeatable && (
                                                <Badge className="text-xs font-medium border text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700">
                                                    Repeatable {quest.cooldownDays ? `(${quest.cooldownDays}d)` : ''}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditQuest(quest)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteQuest(quest.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {totalPages > 1 && (
                        <div className="col-span-full">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                                className="mt-6"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Clone Modal */}
            <QuestEditModal
                quest={cloneModalOpen.open && cloneModalOpen.quest ? {
                    title: cloneModalOpen.quest.title,
                    description: cloneModalOpen.quest.description,
                    bounty: cloneModalOpen.quest.bounty,
                    status: 'AVAILABLE',
                    isRepeatable: cloneModalOpen.quest.isRepeatable,
                    cooldownDays: cloneModalOpen.quest.cooldownDays,
                } as any : null}
                isOpen={cloneModalOpen.open}
                onClose={() => setCloneModalOpen({ open: false, quest: null })}
                onSave={() => window.location.reload()} // or trigger a refetch if available
            />
        </div>
    );
};

export default QuestManagement;
