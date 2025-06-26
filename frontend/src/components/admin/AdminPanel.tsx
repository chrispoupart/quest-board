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
    Store
} from 'lucide-react';
import QuestManagement from './QuestManagement';
import UserManagement from './UserManagement';
import ApprovalWorkflow from './ApprovalWorkflow';
import { StoreManagement } from './StoreManagement';

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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
                            <Crown className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-amber-900 font-serif">Guild Hall</h1>
                    </div>
                    <p className="text-amber-700 text-lg">
                        Welcome, <span className="font-semibold">{getRoleTitle(user.role)} {user.name}</span>
                    </p>
                    <p className="text-amber-600">
                        {isAdmin ? 'Full administrative powers at your command' : 'Quest creation and management tools'}
                    </p>
                </div>

                {/* Admin Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 bg-amber-100 border border-amber-300 max-w-3xl mx-auto">
                        <TabsTrigger
                            value="quests"
                            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium flex items-center gap-2"
                        >
                            <Scroll className="w-4 h-4" />
                            Quest Management
                        </TabsTrigger>
                        <TabsTrigger
                            value="approvals"
                            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approvals
                        </TabsTrigger>
                        <TabsTrigger
                            value="store"
                            className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium flex items-center gap-2"
                        >
                            <Store className="w-4 h-4" />
                            Store Management
                        </TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger
                                value="users"
                                className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium flex items-center gap-2"
                            >
                                <Users className="w-4 h-4" />
                                User Management
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Quest Management Tab */}
                    <TabsContent value="quests" className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-amber-900 mb-2">Quest Management</h2>
                            <p className="text-amber-700">Create, edit, and manage guild quests</p>
                        </div>
                        <QuestManagement />
                    </TabsContent>

                    {/* Approval Workflow Tab */}
                    <TabsContent value="approvals" className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-amber-900 mb-2">Quest Approvals</h2>
                            <p className="text-amber-700">Review and approve completed quests</p>
                        </div>
                        <ApprovalWorkflow />
                    </TabsContent>

                    {/* Store Management Tab */}
                    <TabsContent value="store" className="space-y-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-amber-900 mb-2">Store Management</h2>
                            <p className="text-amber-700">Manage the guild store</p>
                        </div>
                        <StoreManagement />
                    </TabsContent>

                    {/* User Management Tab (Admin Only) */}
                    {isAdmin && (
                        <TabsContent value="users" className="space-y-6">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-amber-900 mb-2">User Management</h2>
                                <p className="text-amber-700">Manage guild members and permissions</p>
                            </div>
                            <UserManagement />
                        </TabsContent>
                    )}
                </Tabs>

                {/* Admin Status Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
                        <CardContent className="p-6 text-center">
                            <Shield className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                            <div className="text-lg font-bold text-amber-900">Administrative Access</div>
                            <div className="text-sm text-amber-700">{getRoleTitle(user.role)} Level</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
                        <CardContent className="p-6 text-center">
                            <Star className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                            <div className="text-lg font-bold text-amber-900">Guild Management</div>
                            <div className="text-sm text-amber-700">Active & Operational</div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
                        <CardContent className="p-6 text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-3 text-amber-600" />
                            <div className="text-lg font-bold text-amber-900">System Status</div>
                            <div className="text-sm text-amber-700">All Systems Ready</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
