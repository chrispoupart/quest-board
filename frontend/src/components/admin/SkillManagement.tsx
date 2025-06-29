import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { skillService } from '../../services/skillService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { Skill, UserSkill, User, CreateSkillRequest, UpdateSkillRequest } from '../../types';

const SkillManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const loadData = async () => {
    if (!isAuthenticated || !user) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      const [skillsResponse, usersResponse] = await Promise.all([
        skillService.getAllSkills(),
        userService.getAllUsers()
      ]);

      setSkills(skillsResponse);
      setUsers(usersResponse);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    }
  }, [isAuthenticated, user]);

  const loadUserSkills = async (userId: number) => {
    try {
      const response = await skillService.getUserSkills(userId);
      setUserSkills(response.userSkills);
    } catch (err) {
      console.error('Failed to load user skills:', err);
      setError('Failed to load user skills');
    }
  };

  const handleCreateSkill = async () => {
    try {
      setLoading(true);
      const newSkill = await skillService.createSkill(formData as CreateSkillRequest);
      setSkills(prev => [...prev, newSkill]);
      setShowCreateForm(false);
      setFormData({ name: '', description: '' });
      setSuccess('Skill created successfully!');
    } catch (err) {
      console.error('Failed to create skill:', err);
      setError('Failed to create skill');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;

    try {
      setLoading(true);
      const updatedSkill = await skillService.updateSkill(editingSkill.id, formData as UpdateSkillRequest);
      setSkills(prev => prev.map(skill => skill.id === editingSkill.id ? updatedSkill : skill));
      setEditingSkill(null);
      setFormData({ name: '', description: '' });
      setSuccess('Skill updated successfully!');
    } catch (err) {
      console.error('Failed to update skill:', err);
      setError('Failed to update skill');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!confirm('Are you sure you want to delete this skill? This will also remove all user skill levels.')) {
      return;
    }

    try {
      setLoading(true);
      await skillService.deleteSkill(skillId);
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      setSuccess('Skill deleted successfully!');
    } catch (err) {
      console.error('Failed to delete skill:', err);
      setError('Failed to delete skill');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserSkill = async (userId: number, skillId: number, level: number) => {
    try {
      console.log('Updating user skill:', { userId, skillId, level });
      const updatedUserSkill = await skillService.updateUserSkill(userId, skillId, { level });
      console.log('Updated user skill response:', updatedUserSkill);

      // Update the userSkills state
      setUserSkills(prev => {
        if (!prev) return [updatedUserSkill];
        const updated = prev.map(skill =>
          skill.userId === userId && skill.skillId === skillId ? updatedUserSkill : skill
        );
        // If the skill wasn't found, add it
        if (!prev.find(skill => skill.userId === userId && skill.skillId === skillId)) {
          updated.push(updatedUserSkill);
        }
        return updated;
      });

      // Show success message
      setSuccess(`Skill level updated to ${level}`);
      setError(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to update user skill:', err);
      setError('Failed to update user skill');
      setSuccess(null);
    }
  };

  const handleUserSelect = (userId: number) => {
    setSelectedUser(userId);
    loadUserSkills(userId);
  };

  const getUserSkillLevel = (skillId: number): number => {
    if (!userSkills) return 0;
    const userSkill = userSkills.find(skill => skill.skillId === skillId);
    return userSkill?.level || 0;
  };

  const getSkillLevelColor = (level: number): string => {
    if (level >= 4) return 'text-green-600 bg-green-50 border-green-200';
    if (level >= 3) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (level >= 2) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setShowCreateForm(false);
    setEditingSkill(null);
  };

  if (loading && skills.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-primary">Loading skills...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Skill Management</h2>
            <p className="text-muted-foreground">Manage skills and user skill levels</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-2 border-destructive bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-2 border-green-500 bg-green-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Skill Form */}
      {(showCreateForm || editingSkill) && (
        <Card className="border-2 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              {editingSkill ? 'Edit Skill' : 'Create New Skill'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="skill-name" className="text-foreground">Skill Name</Label>
              <Input
                id="skill-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 bg-background border-border"
              />
            </div>
            <div>
              <Label htmlFor="skill-desc" className="text-foreground">Skill Description</Label>
              <Textarea
                id="skill-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 bg-background border-border"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={editingSkill ? handleUpdateSkill : handleCreateSkill}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingSkill ? 'Save Changes' : 'Create Skill'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Skills List */}
        <div className="md:col-span-1">
          <Card className="border-2 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">All Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {skills.map(skill => (
                <div key={skill.id} className="p-3 rounded-lg flex justify-between items-center bg-background border border-border">
                  <div>
                    <h3 className="font-semibold text-foreground">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingSkill(skill); setFormData({ name: skill.name, description: skill.description || '' }); setShowCreateForm(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteSkill(skill.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* User Skill Levels */}
        <div className="md:col-span-2">
          <Card className="border-2 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">User Skill Levels</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <select
                  onChange={(e) => handleUserSelect(Number(e.target.value))}
                  className="p-2 border rounded-md bg-background border-border text-foreground"
                >
                  <option>Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedUser && (
                <div className="space-y-2">
                  {skills.map(skill => (
                    <div key={skill.id} className="p-3 rounded-lg flex justify-between items-center bg-background border border-border">
                      <div>
                        <h3 className="font-semibold text-foreground">{skill.name}</h3>
                        <p className="text-sm text-muted-foreground">Current Level: {getUserSkillLevel(skill.id)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          defaultValue={getUserSkillLevel(skill.id)}
                          onBlur={(e) => handleUpdateUserSkill(selectedUser, skill.id, Number(e.target.value))}
                          className="w-20 bg-input border-border"
                        />
                        <Badge className={`border ${getSkillLevelColor(getUserSkillLevel(skill.id))}`}>
                          Level {getUserSkillLevel(skill.id)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillManagement;
