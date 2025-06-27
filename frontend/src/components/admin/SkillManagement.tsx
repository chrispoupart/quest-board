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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3 text-amber-600">Loading skills...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-amber-900">Skill Management</h2>
            <p className="text-amber-700">Manage skills and user skill levels</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Skill Form */}
      {(showCreateForm || editingSkill) && (
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">
              {editingSkill ? 'Edit Skill' : 'Create New Skill'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skillName" className="text-amber-900">Skill Name</Label>
              <Input
                id="skillName"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter skill name"
                className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillDescription" className="text-amber-900">Description</Label>
              <Textarea
                id="skillDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter skill description"
                className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingSkill ? handleUpdateSkill : handleCreateSkill}
                disabled={loading || !formData.name.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingSkill ? 'Update Skill' : 'Create Skill'}
              </Button>
              <Button
                onClick={resetForm}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skills List */}
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Available Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skills.length === 0 ? (
                <p className="text-amber-600 text-center py-4">No skills available.</p>
              ) : (
                skills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border border-amber-200 rounded-lg bg-white">
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900">{skill.name}</h4>
                      {skill.description && (
                        <p className="text-sm text-amber-600 mt-1">{skill.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSkill(skill);
                          setFormData({ name: skill.name, description: skill.description || '' });
                        }}
                        className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Skills Management */}
        <Card className="border-2 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900 flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Selector */}
            <div className="space-y-2">
              <Label className="text-amber-900">Select User</Label>
              <select
                value={selectedUser || ''}
                onChange={(e) => handleUserSelect(Number(e.target.value))}
                className="w-full p-2 border border-amber-300 rounded-md focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="">Choose a user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.characterName || user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* User Skills */}
            {selectedUser && (
              <div className="space-y-3">
                <h4 className="font-medium text-amber-900">Skill Levels</h4>
                {skills.length === 0 ? (
                  <p className="text-amber-600 text-center py-4">No skills available.</p>
                ) : (
                  skills.map((skill) => {
                    const level = getUserSkillLevel(skill.id);
                    const levelColor = getSkillLevelColor(level);

                    return (
                      <div key={skill.id} className="flex items-center justify-between p-3 border border-amber-200 rounded-lg bg-white">
                        <div className="flex-1">
                          <h5 className="font-medium text-amber-900">{skill.name}</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs font-medium border ${levelColor}`}>
                            Level {level}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((skillLevel) => (
                              <Button
                                key={skillLevel}
                                size="sm"
                                variant={level === skillLevel ? "default" : "outline-solid"}
                                onClick={() => handleUpdateUserSkill(selectedUser, skill.id, skillLevel)}
                                className={`w-8 h-8 p-0 ${
                                  level === skillLevel
                                    ? 'bg-amber-600 text-white'
                                    : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                }`}
                              >
                                {skillLevel}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillManagement;
