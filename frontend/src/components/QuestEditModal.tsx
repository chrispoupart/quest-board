import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Quest, Skill, CreateQuestRequiredSkillRequest, User } from '../types';
import { questService } from '../services/questService';
import { skillService } from '../services/skillService';
import { userService } from '../services/userService';

interface QuestEditModalProps {
  quest: Quest | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const QuestEditModal: React.FC<QuestEditModalProps> = ({ quest, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bounty: 0,
    isRepeatable: false,
    cooldownDays: undefined as number | undefined,
  });
  const [skillRequirements, setSkillRequirements] = useState<CreateQuestRequiredSkillRequest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assignedUserId, setAssignedUserId] = useState<number | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && quest) {
      setFormData({
        title: quest.title,
        description: quest.description || '',
        bounty: quest.bounty,
        isRepeatable: quest.isRepeatable,
        cooldownDays: quest.cooldownDays,
      });
      setAssignedUserId((quest as any).userId ?? undefined);
      skillService.getQuestRequiredSkills(quest.id)
        .then(existingSkills => setSkillRequirements(existingSkills.map(skill => ({ skillId: skill.skillId, minLevel: skill.minLevel }))))
        .catch(() => setSkillRequirements([]));
      skillService.getAllSkills().then(setSkills).catch(() => setSkills([]));
      userService.getAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
    }
  }, [isOpen, quest]);

  const handleUpdateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quest || !formData.title || formData.bounty <= 0) {
      setError('Please fill in all required fields');
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      await questService.updateQuestWithSkills(quest.id, {
        ...formData,
        userId: assignedUserId ?? null,
        skillRequirements: skillRequirements.length > 0 ? skillRequirements : undefined,
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update quest');
    } finally {
      setSubmitting(false);
    }
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

  if (!isOpen || !quest) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground font-serif">Edit Quest</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          )}
          <form onSubmit={handleUpdateQuest} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="font-medium text-foreground">Title *</label>
                <Input id="title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <label htmlFor="bounty" className="font-medium text-foreground">Bounty *</label>
                <Input id="bounty" type="number" value={formData.bounty} onChange={e => setFormData({ ...formData, bounty: Number(e.target.value) })} required className="bg-background border-border" />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="font-medium text-foreground">Description</label>
              <textarea id="description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full p-2 border rounded-md bg-background border-border min-h-[100px]" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isRepeatable" checked={formData.isRepeatable} onChange={e => setFormData({ ...formData, isRepeatable: e.target.checked })} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                <label htmlFor="isRepeatable" className="font-medium text-foreground">Is Repeatable?</label>
              </div>
              {formData.isRepeatable && (
                <div className="space-y-2 flex-1">
                  <label htmlFor="cooldownDays" className="font-medium text-foreground">Cooldown (Days)</label>
                  <Input id="cooldownDays" type="number" value={formData.cooldownDays} onChange={e => setFormData({ ...formData, cooldownDays: Number(e.target.value) || undefined })} className="bg-background border-border" />
                </div>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Skill Requirements</h3>
              {skillRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg bg-background border-border">
                  <select value={req.skillId} onChange={e => updateSkillRequirement(index, 'skillId', Number(e.target.value))} className="p-2 border rounded-md bg-background border-border">
                    <option value={0} disabled>Select a skill</option>
                    {skills.map(skill => (
                      <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                  <Input type="number" value={req.minLevel} onChange={e => updateSkillRequirement(index, 'minLevel', Number(e.target.value))} placeholder="Min Level" className="w-32 bg-background border-border" />
                  <Button type="button" variant="destructive" onClick={() => removeSkillRequirement(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addSkillRequirement}>Add Skill Requirement</Button>
            </div>
            <div className="space-y-2">
              <label htmlFor="assignUser" className="font-medium text-foreground">Assign to User (optional)</label>
              <select id="assignUser" value={assignedUserId ?? ''} onChange={e => setAssignedUserId(e.target.value ? Number(e.target.value) : undefined)} className="p-2 border rounded-md bg-background border-border w-full">
                <option value="">None (Global Quest)</option>
                {allUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>) : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestEditModal;
