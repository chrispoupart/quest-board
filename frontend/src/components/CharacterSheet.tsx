import React, { useState, useEffect } from 'react';
import {
  User,
  Upload,
  Save,
  Shield,
  Sword,
  Wand2,
  ArrowLeft,
  Crown,
  Scroll,
  Palette,
  Heart,
  Star,
  CheckCircle,
  AlertCircle
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
import { User as UserType } from '../types';

interface CharacterSheetProps {
  onBack?: () => void;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ onBack }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    characterName: '',
    characterClass: '',
    characterBio: '',
    preferredPronouns: '',
    favoriteColor: '',
    avatarUrl: ''
  });

  // Character class options
  const characterClasses = [
    { value: 'warrior', label: 'Warrior', icon: <Sword className="w-4 h-4" />, color: 'text-red-600 bg-red-50 border-red-200' },
    { value: 'mage', label: 'Mage', icon: <Wand2 className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { value: 'rogue', label: 'Rogue', icon: <Shield className="w-4 h-4" />, color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'cleric', label: 'Cleric', icon: <Heart className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'ranger', label: 'Ranger', icon: <Star className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { value: 'bard', label: 'Bard', icon: <Scroll className="w-4 h-4" />, color: 'text-pink-600 bg-pink-50 border-pink-200' },
    { value: 'paladin', label: 'Paladin', icon: <Crown className="w-4 h-4" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'wizard', label: 'Wizard', icon: <Wand2 className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
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
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // For now, we'll use a placeholder URL
    // In a real implementation, you'd upload to a service like Cloudinary or AWS S3
    const placeholderUrl = URL.createObjectURL(file);
    handleInputChange('avatarUrl', placeholderUrl);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-600">Loading character sheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-amber-900 font-serif">Character Sheet</h1>
              <p className="text-amber-700">Customize your adventurer's identity</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Card className="border-2 border-red-200 bg-red-50 shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="border-2 border-green-200 bg-green-50 shadow-md mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Character Preview */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900 font-serif">Character Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="text-center">
                  <Avatar className="w-24 h-24 mx-auto border-4 border-amber-300">
                    <AvatarImage src={formData.avatarUrl || user.avatarUrl} alt="Character Avatar" />
                    <AvatarFallback className="bg-amber-200 text-amber-800 font-bold text-2xl">
                      {formData.characterName ? formData.characterName.charAt(0).toUpperCase() : user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm text-amber-600 mt-2">Avatar Preview</p>
                </div>

                {/* Character Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-amber-900 text-lg">
                      {formData.characterName || 'Unnamed Character'}
                    </h3>
                    <p className="text-amber-700 text-sm">{user.email}</p>
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
                    <Star className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700">Level {user.level || 1}</span>
                  </div>

                  {user.experience !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">XP</span>
                      </div>
                      <span className="text-amber-700 text-sm">{user.experience} Experience</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-700">{getRoleTitle(user.role)}</span>
                  </div>

                  {formData.favoriteColor && (
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">Favorite: {formData.favoriteColor}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Character Form */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-amber-200 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-amber-900 font-serif">Character Details</CardTitle>
                <p className="text-amber-700">Customize your character's identity and appearance</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Character Name */}
                <div className="space-y-2">
                  <Label htmlFor="characterName" className="text-amber-900 font-medium">
                    Character Name *
                  </Label>
                  <Input
                    id="characterName"
                    placeholder="Enter your character's name (not your real name)"
                    value={formData.characterName}
                    onChange={(e) => handleInputChange('characterName', e.target.value)}
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <p className="text-xs text-amber-600">
                    Choose a unique name for your character. This will be displayed to other guild members.
                  </p>
                </div>

                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label className="text-amber-900 font-medium">Character Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <span className="text-sm text-amber-600">
                      Recommended: Square image, 200x200px or larger
                    </span>
                  </div>
                </div>

                {/* Character Class */}
                <div className="space-y-2">
                  <Label className="text-amber-900 font-medium">Character Class</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {characterClasses.map((charClass) => (
                      <Button
                        key={charClass.value}
                        variant={formData.characterClass === charClass.value ? "default" : "outline"}
                        onClick={() => handleInputChange('characterClass', charClass.value)}
                        className={`h-auto p-3 flex flex-col items-center gap-2 ${
                          formData.characterClass === charClass.value
                            ? 'bg-amber-600 text-white'
                            : 'border-amber-300 text-amber-700 hover:bg-amber-50'
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
                  <Label className="text-amber-900 font-medium">Preferred Pronouns</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {pronounOptions.map((pronoun) => (
                      <Button
                        key={pronoun.value}
                        variant={formData.preferredPronouns === pronoun.value ? "default" : "outline"}
                        onClick={() => handleInputChange('preferredPronouns', pronoun.value)}
                        className={`h-auto p-2 ${
                          formData.preferredPronouns === pronoun.value
                            ? 'bg-amber-600 text-white'
                            : 'border-amber-300 text-amber-700 hover:bg-amber-50'
                        }`}
                      >
                        {pronoun.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Favorite Color */}
                <div className="space-y-2">
                  <Label className="text-amber-900 font-medium">Favorite Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <Button
                        key={color.value}
                        variant={formData.favoriteColor === color.value ? "default" : "outline"}
                        onClick={() => handleInputChange('favoriteColor', color.value)}
                        className={`h-12 p-0 relative ${
                          formData.favoriteColor === color.value
                            ? 'ring-2 ring-amber-600'
                            : 'border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        <div className={`w-full h-full ${color.color} rounded`}></div>
                        {formData.favoriteColor === color.value && (
                          <CheckCircle className="w-4 h-4 text-white absolute top-1 right-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Character Bio */}
                <div className="space-y-2">
                  <Label htmlFor="characterBio" className="text-amber-900 font-medium">
                    Character Bio
                  </Label>
                  <Textarea
                    id="characterBio"
                    placeholder="Tell us about your character's backstory, personality, or any interesting details..."
                    value={formData.characterBio}
                    onChange={(e) => handleInputChange('characterBio', e.target.value)}
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-amber-600">
                    {formData.characterBio.length}/500 characters
                  </p>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
