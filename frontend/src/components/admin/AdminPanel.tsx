import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
    Crown,
    Scroll,
    Users,
    CheckCircle,
    Shield,
    Star,
    Trophy,
    Store,
    Target,
    Gift
} from 'lucide-react';
import QuestManagement from './QuestManagement';
import UserManagement from './UserManagement';
import ApprovalWorkflow from './ApprovalWorkflow';
import { StoreManagement } from './StoreManagement';
import SkillManagement from './SkillManagement';
import RewardManagement from './RewardManagement';

interface AdminPanelProps { }

const AdminPanel: React.FC<AdminPanelProps> = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('quests');

    if (!user) {
        return null;
    }

    const getRoleTitle = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'Guild Master';
            case 'EDITOR':
                return 'Quest Giver';
            default:
                return 'Adventurer';
        }
    };

    const isAdmin = user.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                            <Crown className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <h1 className="text-4xl font-bold text-foreground font-serif">Guild Hall</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Welcome, <span className="font-semibold">{getRoleTitle(user.role)} {user.name}</span>
                    </p>
                    <p className="text-muted-foreground">
                        {isAdmin ? 'Full administrative powers at your command' : 'Quest creation and management tools'}
                    </p>
                </div>

                {/* Admin Tabs */}
                {/* Mobile Dropdown */}
                <div className="block md:hidden max-w-4xl mx-auto mb-4">
                    <select
                        className="w-full rounded px-3 py-2 border border-border bg-background text-foreground"
                        value={activeTab}
                        onChange={e => setActiveTab(e.target.value)}
                    >
                        <option value="quests">Quest Management</option>
                        <option value="approvals">Approvals</option>
                        <option value="store">Store Management</option>
                        <option value="skills">Skills</option>
                        {isAdmin && <option value="rewards">Reward Management</option>}
                        {isAdmin && <option value="users">User Management</option>}
                    </select>
                </div>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className={`hidden md:grid w-full ${isAdmin ? 'grid-cols-6' : 'grid-cols-4'} bg-muted border border-border max-w-4xl mx-auto`}>
                        <TabsTrigger
                            value="quests"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center gap-2"
                        >
                            <Scroll className="w-4 h-4" />
                            Quest Management
                        </TabsTrigger>
                        <TabsTrigger
                            value="approvals"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approvals
                        </TabsTrigger>
                        <TabsTrigger
                            value="store"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center gap-2"
                        >
                            <Store className="w-4 h-4" />
                            Store Management
                        </TabsTrigger>
                        <TabsTrigger
                            value="skills"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center gap-2"
                        >
                            <Target className="w-4 h-4" />
                            Skills
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger
                                value="rewards"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center gap-2"
                            >
                                <Gift className="w-4 h-4" />
                                Reward Management
                            </TabsTrigger>
                        )}
                        {isAdmin && (
                            <TabsTrigger
                                value="users"
                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                User Management
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Quest Management Tab */}
                    <TabsContent value="quests" className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground mb-2">Quest Management</h2>
                            <p className="text-muted-foreground">Create, edit, and manage guild quests</p>
                        </div>
                        <QuestManagement />
                    </TabsContent>

                    {/* Approval Workflow Tab */}
                    <TabsContent value="approvals" className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground mb-2">Quest Approvals</h2>
                            <p className="text-muted-foreground">Review and approve completed quests</p>
                        </div>
                        <ApprovalWorkflow />
                    </TabsContent>

                    {/* Store Management Tab */}
                    <TabsContent value="store" className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-foreground mb-2">Store Management</h2>
                            <p className="text-muted-foreground">Manage the guild store</p>
                        </div>
                        <StoreManagement />
                    </TabsContent>

                    {/* Skills Management Tab */}
                    <TabsContent value="skills" className="space-y-6">
                        <SkillManagement />
                    </TabsContent>

                    {/* Reward Management Tab (Admin Only) */}
                    {isAdmin && (
                        <TabsContent value="rewards" className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Reward Management</h2>
                                <p className="text-muted-foreground">Configure collective rewards and monthly prizes</p>
                            </div>
                            <RewardManagement />
                        </TabsContent>
                    )}

                    {/* User Management Tab (Admin Only) */}
                    {isAdmin && (
                        <TabsContent value="users" className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-foreground mb-2">User Management</h2>
                                <p className="text-muted-foreground">Manage guild members and permissions</p>
                            </div>
                            <UserManagement />
                        </TabsContent>
                    )}
                </Tabs>

                {/* Admin Status Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-2 border-border bg-card shadow-lg">
                        <CardContent className="p-6 text-center">
                            <Shield className="w-12 h-12 mx-auto mb-3 text-primary" />
                            <div className="text-lg font-bold text-foreground">Administrative Access</div>
                            <div className="text-sm text-muted-foreground">{getRoleTitle(user.role)} Level</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-border bg-card shadow-lg">
                        <CardContent className="p-6 text-center">
                            <Star className="w-12 h-12 mx-auto mb-3 text-primary" />
                            <div className="text-lg font-bold text-foreground">Guild Management</div>
                            <div className="text-sm text-muted-foreground">Active & Operational</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-border bg-card shadow-lg">
                        <CardContent className="p-6 text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-3 text-primary" />
                            <div className="text-lg font-bold text-foreground">System Status</div>
                            <div className="text-sm text-muted-foreground">All Systems Ready</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
