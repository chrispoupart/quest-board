import React, { useState, useEffect } from 'react';
import {
  User,
  Star,
  Crown,
  Palette,
  ArrowLeft,
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
  onBack?: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ onBack }) => {
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

      // Update the auth context
      if (updateUser) {
        updateUser(updatedUser);
      }

      // Clean up the previous avatar URL after successful save
      if (previousAvatarUrl && previousAvatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previousAvatarUrl);
        setPreviousAvatarUrl(null);
      }

      setSuccess('Character sheet updated successfully!');
    } catch (err) {
      console.error('Failed to update character sheet:', err);
      setError(err instanceof Error ? err.message : 'Failed to update character sheet');
    } finally {
      setSaving(false);
    }
  };

  const getCharacterClassInfo = (className: string) => {
    return characterClasses.find(c => c.value === className);
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
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="border-border text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground font-serif">Character Sheet</h1>
              <p className="text-muted-foreground">Customize your adventurer's identity</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Card className="border-2 border-destructive bg-destructive/10 shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-2 border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/30 shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Character Preview */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground font-serif">Character Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-primary/50">
                    {uploadingAvatar ? (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <AvatarImage src={formData.avatarUrl || user.avatarUrl} alt="Character Avatar" />
                    )}
                    <AvatarFallback className="bg-muted text-muted-foreground font-bold text-2xl">
                      {formData.characterName ? formData.characterName.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-muted-foreground mt-2">
                    {uploadingAvatar ? 'Processing...' : 'Avatar Preview'}
                  </p>
                </div>

                {/* Character Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">
                      {formData.characterName || 'Unnamed Character'}
                    </h3>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>

                  {formData.characterClass && (
                    <div className="flex items-center gap-2">
                      {getCharacterClassInfo(formData.characterClass)?.icon}
                      <Badge className={`text-xs font-medium border ${getCharacterClassInfo(formData.characterClass)?.color}`}>
                        {getCharacterClassInfo(formData.characterClass)?.label}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Level {user.level || 1}</span>
                  </div>

                  {user.experience !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-xs font-bold">XP</span>
                      </div>
                      <span className="text-muted-foreground text-sm">{user.experience} Experience</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{getRoleTitle(user.role)}</span>
                  </div>

                  {formData.favoriteColor && (
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Favorite: {formData.favoriteColor}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Character Form and Skills */}
          <div className="lg:col-span-2 space-y-8">
            {/* Character Form */}
            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground font-serif">Character Details</CardTitle>
                <p className="text-muted-foreground">Customize your character's identity and appearance</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Character Name */}
                <div className="space-y-2">
                  <Label htmlFor="characterName" className="text-foreground font-medium">
                    Character Name *
                  </Label>
                  <Input
                    id="characterName"
                    placeholder="Enter your character's name (not your real name)"
                    value={formData.characterName}
                    onChange={(e) => handleInputChange('characterName', e.target.value)}
                    className="bg-background border-border focus:border-ring focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    Choose a unique name for your character. This will be displayed to other guild members.
                  </p>
                </div>

                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Character Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={uploadingAvatar}
                      className="border-border text-muted-foreground hover:bg-muted disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </>
                      )}
                    </Button>
                    {(formData.avatarUrl || user.avatarUrl) && (
                      <Button
                        variant="outline"
                        onClick={handleClearAvatar}
                        disabled={uploadingAvatar}
                        className="border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                    <span className="text-sm text-muted-foreground">
                      {uploadingAvatar ? 'Processing image...' : 'Recommended: Square image, 200x200px or larger'}
                    </span>
                  </div>
                </div>

                {/* Character Class */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Character Class</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {characterClasses.map((charClass) => (
                      <Button
                        key={charClass.value}
                        variant={formData.characterClass === charClass.value ? "default" : "outline"}
                        onClick={() => handleInputChange('characterClass', charClass.value)}
                        className={`h-auto p-3 flex flex-col items-center gap-2 ${
                          formData.characterClass === charClass.value
                            ? 'bg-primary text-primary-foreground'
                            : 'border-border text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {charClass.icon}
                        <span className="text-xs">{charClass.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Preferred Pronouns */}
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

                {/* Favorite Color */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Favorite Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <Button
                        key={color.value}
                        variant={formData.favoriteColor === color.value ? "default" : "outline"}
                        onClick={() => handleInputChange('favoriteColor', color.value)}
                        className={`h-12 p-0 relative ${
                          formData.favoriteColor === color.value
                            ? 'ring-2 ring-ring' // Use theme ring
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className={`w-full h-full ${color.color} rounded`}></div>
                        {formData.favoriteColor === color.value && (
                          <CheckCircle className="w-4 h-4 text-primary-foreground absolute top-1 right-1" /> // Ensure contrast
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Character Bio */}
                <div className="space-y-2">
                  <Label htmlFor="characterBio" className="text-foreground font-medium">
                    Character Bio
                  </Label>
                  <Textarea
                    id="characterBio"
                    placeholder="Tell us about your character's backstory, personality, or any interesting details..."
                    value={formData.characterBio}
                    onChange={(e) => handleInputChange('characterBio', e.target.value)}
                    className="bg-background border-border focus:border-ring focus:ring-ring min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.characterBio.length}/500 characters
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Character
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card className="border-2 border-border bg-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-foreground font-serif flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Skills & Abilities
                </CardTitle>
                <p className="text-muted-foreground">
                  Manage your character's skills. Guild Masters can adjust skill levels based on your performance.
                </p>
              </CardHeader>
              <CardContent>
                {loadingSkills ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-muted-foreground">Loading skills...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allSkills.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">No skills available yet.</p>
                    ) : (
                      allSkills.map(renderSkillLevel)
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
