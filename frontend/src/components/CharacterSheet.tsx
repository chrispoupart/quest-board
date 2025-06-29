import React, { useState, useEffect } from 'react';
import {
  User,
  Star,
  Crown,
  Upload,
  CheckCircle,
  AlertCircle,
  Target,
  X,
  Sword,
  Wand2,
  Shield,
  Heart,
  Scroll,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { skillService } from '../services/skillService';
import { Skill, UserSkill } from '../types';

interface CharacterSheetProps {
}

const CharacterSheet: React.FC<CharacterSheetProps> = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previousAvatarUrl, setPreviousAvatarUrl] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    characterName: string;
    characterClass: string;
    characterBio: string;
    preferredPronouns: string;
    favoriteColor: string;
    avatarUrl: string;
  }>({
    characterName: '',
    characterClass: '',
    characterBio: '',
    preferredPronouns: '',
    favoriteColor: '',
    avatarUrl: ''
  });

  // Character class options
  const characterClasses = [
    { value: 'warrior', label: 'Warrior', icon: <Sword className="w-4 h-4" />, color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700' },
    { value: 'mage', label: 'Mage', icon: <Wand2 className="w-4 h-4" />, color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700' },
    { value: 'rogue', label: 'Rogue', icon: <Shield className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700' },
    { value: 'cleric', label: 'Cleric', icon: <Heart className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' },
    { value: 'ranger', label: 'Ranger', icon: <Star className="w-4 h-4" />, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700' },
    { value: 'bard', label: 'Bard', icon: <Scroll className="w-4 h-4" />, color: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700' },
    { value: 'paladin', label: 'Paladin', icon: <Crown className="w-4 h-4" />, color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700' }, // Changed yellow to orange for better contrast potentially
    { value: 'wizard', label: 'Wizard', icon: <Wand2 className="w-4 h-4" />, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700' },
  ];

  // Pronoun options
  const pronounOptions = [
    { value: 'he/him', label: 'He/Him' },
    { value: 'she/her', label: 'She/Her' },
    { value: 'they/them', label: 'They/Them' },
    { value: 'he/they', label: 'He/They' },
    { value: 'she/they', label: 'She/They' },
    { value: 'any', label: 'Any Pronouns' },
    { value: 'custom', label: 'Custom' }
  ];

  // Color options
  const colorOptions = [
    { value: 'red', label: 'Red', color: 'bg-red-500' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'green', label: 'Green', color: 'bg-green-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', color: 'bg-pink-500' },
    { value: 'yellow', label: 'Yellow', color: 'bg-yellow-500' },
    { value: 'teal', label: 'Teal', color: 'bg-teal-500' },
    { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
    { value: 'gray', label: 'Gray', color: 'bg-gray-500' },
  ];

  // Load user data and skills when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        characterName: user.characterName || '',
        characterClass: user.characterClass || '',
        characterBio: user.characterBio || '',
        preferredPronouns: user.preferredPronouns || '',
        favoriteColor: user.favoriteColor || '',
        avatarUrl: user.avatarUrl || ''
      });

      // Load skills only if authenticated
      if (isAuthenticated) {
        loadSkills();
      }
    }
  }, [user, isAuthenticated]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up the previous avatar URL when component unmounts
      if (previousAvatarUrl && previousAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previousAvatarUrl);
      }
    };
  }, [previousAvatarUrl]);

  const loadSkills = async () => {
    if (!user) return;

    try {
      setLoadingSkills(true);
      const [userSkillsResponse, allSkillsResponse] = await Promise.all([
        skillService.getMySkills(),
        skillService.getAllSkills()
      ]);

      setUserSkills(userSkillsResponse);
      setAllSkills(allSkillsResponse);
    } catch (err) {
      console.error('Failed to load skills:', err);
      setError('Failed to load skills');
    } finally {
      setLoadingSkills(false);
    }
  };

  const getSkillLevel = (skillId: number): number => {
    const userSkill = userSkills.find(skill => skill.skillId === skillId);
    return userSkill?.level || 0;
  };

  const getSkillLevelColor = (level: number): string => {
    if (level >= 4) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
    if (level >= 3) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
    if (level >= 2) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700';
  };

  const renderSkillLevel = (skill: Skill) => {
    const level = getSkillLevel(skill.id);
    const levelColor = getSkillLevelColor(level);

    return (
      // Removed bg-white, assuming this will be inside a Card component which provides bg-card
      <div key={skill.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{skill.name}</h4>
          {skill.description && (
            <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs font-medium border ${levelColor}`}>
            Level {level}
          </Badge>
        </div>
      </div>
    );
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError(null);
    setSuccess(null);

    try {
      // File type validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or WebP)');
        setUploadingAvatar(false);
        return;
      }

      // File size validation (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image file size must be less than 5MB');
        setUploadingAvatar(false);
        return;
      }

      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Failed to process image');
        setUploadingAvatar(false);
        return;
      }

      // Create an image element to load the file
      const img = new Image();
      img.onload = () => {
        // Set canvas size to 200x200
        canvas.width = 200;
        canvas.height = 200;

        // Calculate scaling to maintain aspect ratio
        const scale = Math.min(200 / img.width, 200 / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (200 - scaledWidth) / 2;
        const y = (200 - scaledHeight) / 2;

        // Draw the resized image centered on the canvas
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new blob URL
            const resizedImageUrl = URL.createObjectURL(blob);

            // Clean up the previous avatar URL to prevent memory leaks
            if (previousAvatarUrl && previousAvatarUrl.startsWith('blob:')) {
              URL.revokeObjectURL(previousAvatarUrl);
            }

            handleInputChange('avatarUrl', resizedImageUrl);
            setError(null);
            setSuccess('Avatar processed successfully!');
            setPreviousAvatarUrl(resizedImageUrl);
          } else {
            setError('Failed to process image');
          }
          setUploadingAvatar(false);
        }, 'image/jpeg', 0.8); // Convert to JPEG with 80% quality
      };

      img.onerror = () => {
        setError('Failed to load image');
        setUploadingAvatar(false);
      };

      // Load the image from the file
      const fileUrl = URL.createObjectURL(file);
      img.src = fileUrl;

      // Clean up the temporary file URL
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);

    } catch (error) {
      console.error('Error processing avatar:', error);
      setError('Failed to process image');
      setUploadingAvatar(false);
    }
  };

  const handleClearAvatar = () => {
    // Clean up the previous avatar URL to prevent memory leaks
    if (previousAvatarUrl && previousAvatarUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previousAvatarUrl);
    }
    handleInputChange('avatarUrl', '');
    setPreviousAvatarUrl(null);
    setSuccess('Avatar removed');
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updatedUser = await userService.updateCurrentUser({
        characterName: formData.characterName,
        characterClass: formData.characterClass,
        characterBio: formData.characterBio,
        preferredPronouns: formData.preferredPronouns,
        favoriteColor: formData.favoriteColor,
        avatarUrl: formData.avatarUrl
      });

      updateUser(updatedUser);
      setSuccess('Character sheet updated successfully!');
    } catch (err) {
      console.error('Failed to update character sheet:', err);
      setError('Failed to update character sheet');
    } finally {
      setSaving(false);
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
        return role;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading character sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <Card className="border-2 border-border bg-card shadow-lg">
          <CardHeader className="border-b border-border bg-muted/40">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground font-serif">Character Sheet</h1>
                  <p className="text-muted-foreground">
                    Welcome, <span className="font-semibold">{getRoleTitle(user?.role || '')} {user?.name}</span>
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving || uploadingAvatar}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Success and Error Messages */}
            {success && (
              <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-bold">Success</p>
                    <p>{success}</p>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  <div>
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Character Details */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="border-border bg-background">
                  <CardHeader>
                    <CardTitle>Avatar</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32 border-4 border-primary shadow-lg">
                      <AvatarImage src={formData.avatarUrl || user?.avatarUrl || ''} alt="User Avatar" />
                      <AvatarFallback className="text-4xl">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex gap-2 w-full">
                      <Button
                        className="w-full justify-between bg-card border-border text-foreground hover:bg-accent"
                      >
                        <label htmlFor="avatar-upload" className="flex items-center justify-center">
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingAvatar ? 'Uploading...' : 'Upload'}
                          <Input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            onChange={handleAvatarUpload}
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadingAvatar}
                          />
                        </label>
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleClearAvatar}
                        disabled={!formData.avatarUrl || uploadingAvatar}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-background">
                  <CardHeader>
                    <CardTitle>Character Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="characterName" className="text-foreground font-medium">Character Name</Label>
                      <Input
                        id="characterName"
                        value={formData.characterName}
                        onChange={(e) => handleInputChange('characterName', e.target.value)}
                        placeholder="E.g., Alistair Ironhand"
                        className="bg-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Character Class</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {characterClasses.map((charClass) => (
                          <Button
                            key={charClass.value}
                            variant={formData.characterClass === charClass.value ? "default" : "outline"}
                            onClick={() => handleInputChange('characterClass', charClass.value)}
                            className="h-auto p-2 flex items-center gap-2 justify-start"
                          >
                            {charClass.icon}
                            <span className="truncate">{charClass.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Customization and Skills */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-border bg-background">
                  <CardHeader>
                    <CardTitle>Customization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Character Bio</Label>
                      <Textarea
                        value={formData.characterBio}
                        onChange={(e) => handleInputChange('characterBio', e.target.value)}
                        placeholder="Tell us about your character's backstory, motivations, and personality."
                        className="bg-input h-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Preferred Pronouns</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {pronounOptions.map((pronoun) => (
                          <Button
                            key={pronoun.value}
                            variant={formData.preferredPronouns === pronoun.value ? "default" : "outline"}
                            onClick={() => handleInputChange('preferredPronouns', pronoun.value)}
                            className={`h-auto p-2 ${
                              formData.preferredPronouns === pronoun.value
                                ? 'bg-primary text-primary-foreground'
                                : 'border-border text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {pronoun.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Favorite Color</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <Button
                            key={color.value}
                            variant="outline"
                            onClick={() => handleInputChange('favoriteColor', color.value)}
                            className={`h-12 p-0 relative ${
                              formData.favoriteColor === color.value
                                ? 'ring-2 ring-primary'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            <div className={`w-full h-full ${color.color} rounded`}></div>
                            {formData.favoriteColor === color.value && (
                              <CheckCircle className="w-4 h-4 text-primary-foreground absolute top-1 right-1" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-6 h-6" />
                      Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSkills ? (
                      <p>Loading skills...</p>
                    ) : (
                      <div className="space-y-3">
                        {allSkills.map((skill) => renderSkillLevel(skill))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CharacterSheet;
