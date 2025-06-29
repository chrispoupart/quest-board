import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { User } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    Users,
    Crown,
    Shield,
    User as UserIcon,
    AlertCircle,
    Loader2
} from 'lucide-react';

interface UserManagementProps { }

const UserManagement: React.FC<UserManagementProps> = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const usersData = await userService.getAllUsers();
            setUsers(usersData);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateUserRole = async (userId: number, newRole: 'ADMIN' | 'EDITOR' | 'PLAYER') => {
        try {
            setUpdatingUserId(userId);
            setError(null);
            await userService.updateUserRole(userId, newRole);
            await fetchUsers();
        } catch (err) {
            console.error('Failed to update user role:', err);
            setError(err instanceof Error ? err.message : 'Failed to update user role');
        } finally {
            setUpdatingUserId(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <Crown className="w-5 h-5 text-yellow-600" />;
            case 'EDITOR':
                return <Shield className="w-5 h-5 text-blue-600" />;
            case 'PLAYER':
                return <UserIcon className="w-5 h-5 text-green-600" />;
            default:
                return <UserIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'text-yellow-700 bg-yellow-100 border-yellow-300';
            case 'EDITOR':
                return 'text-blue-700 bg-blue-100 border-blue-300';
            case 'PLAYER':
                return 'text-green-700 bg-green-100 border-green-300';
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
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

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardContent className="p-6 text-center">
                        <Crown className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <div className="text-2xl font-bold text-foreground">
                            {users.filter(u => u.role === 'ADMIN').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Guild Masters</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardContent className="p-6 text-center">
                        <Shield className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <div className="text-2xl font-bold text-foreground">
                            {users.filter(u => u.role === 'EDITOR').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Quest Givers</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardContent className="p-6 text-center">
                        <Users className="w-12 h-12 mx-auto mb-3 text-primary" />
                        <div className="text-2xl font-bold text-foreground">
                            {users.filter(u => u.role === 'PLAYER').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Adventurers</div>
                    </CardContent>
                </Card>
            </div>

            {/* User List */}
            {loading ? (
                <Card className="border-2 border-border bg-card shadow-md">
                    <CardContent className="p-12 text-center">
                        <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
                        <h3 className="text-xl font-bold text-foreground mb-2">Loading Guild Members</h3>
                        <p className="text-muted-foreground">Gathering member information...</p>
                    </CardContent>
                </Card>
            ) : users.length === 0 ? (
                <Card className="border-2 border-border bg-card shadow-md">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-bold text-foreground mb-2">No Users Found</h3>
                        <p className="text-muted-foreground">No guild members are currently registered.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-2 border-border bg-card shadow-lg">
                    <CardHeader className="border-b border-border bg-muted/40">
                        <CardTitle className="flex items-center gap-2 text-foreground font-serif">
                            <Users className="w-6 h-6" />
                            Guild Members ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.id} className="border border-border rounded-lg p-4 bg-background">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                                                {getRoleIcon(user.role)}
                                            </div>

                                            <div>
                                                <h3 className="font-semibold text-foreground text-lg">{user.name}</h3>
                                                <p className="text-muted-foreground text-sm">{user.email}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={`text-xs font-medium border ${getRoleColor(user.role)}`}>
                                                        {getRoleTitle(user.role)}
                                                    </Badge>
                                                    {user.bountyBalance !== undefined && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {user.bountyBalance} bounty
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {user.createdAt && (
                                                <span className="text-xs text-muted-foreground mr-4">
                                                    Joined {formatDate(user.createdAt)}
                                                </span>
                                            )}

                                            {/* Role Change Buttons */}
                                            <div className="flex gap-1">
                                                {user.role !== 'PLAYER' && (
                                                    <Button
                                                        onClick={() => handleUpdateUserRole(user.id, 'PLAYER')}
                                                        disabled={updatingUserId === user.id}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-border text-foreground hover:bg-muted text-xs"
                                                    >
                                                        {updatingUserId === user.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            'Make Player'
                                                        )}
                                                    </Button>
                                                )}

                                                {user.role !== 'EDITOR' && (
                                                    <Button
                                                        onClick={() => handleUpdateUserRole(user.id, 'EDITOR')}
                                                        disabled={updatingUserId === user.id}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-border text-foreground hover:bg-muted text-xs"
                                                    >
                                                        {updatingUserId === user.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            'Make Editor'
                                                        )}
                                                    </Button>
                                                )}

                                                {user.role !== 'ADMIN' && (
                                                    <Button
                                                        onClick={() => handleUpdateUserRole(user.id, 'ADMIN')}
                                                        disabled={updatingUserId === user.id}
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-border text-foreground hover:bg-muted text-xs"
                                                    >
                                                        {updatingUserId === user.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            'Make Admin'
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default UserManagement;
