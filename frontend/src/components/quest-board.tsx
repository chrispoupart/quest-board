import React, { useState, useMemo, useEffect } from "react"
import { Search, Sword, Shield, Coins, Clock, Scroll, Trophy, Check, X, Eye, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QuestDetailsModal from "./QuestDetailsModal"
import { getLevelInfo } from "../utils/leveling"
import { skillService } from "../services/skillService"

import { useAuth } from "../contexts/AuthContext"
import { questService } from "../services/questService"
import { Quest, QuestListingResponse, QuestRequiredSkill } from "../types"

// TypeScript Interfaces (extended from the API types)
interface QuestWithExtras extends Quest {
  difficulty?: "EASY" | "MEDIUM" | "HARD"
  timeLimit?: number // hours
  creatorName?: string
  claimerName?: string
  requiredSkills?: QuestRequiredSkill[]
}

interface UserStats {
  id: number
  completedQuests: number
  totalBounty: number
  currentClaimed: number
  role: "ADMIN" | "EDITOR" | "PLAYER"
  name: string
  avatar?: string
  experience?: number
}

// Utility Functions
const getDifficultyFromBounty = (bounty: number): "EASY" | "MEDIUM" | "HARD" => {
  if (bounty <= 15) return "EASY"
  if (bounty <= 30) return "MEDIUM"
  return "HARD"
}

const getDifficultyColor = (difficulty: "EASY" | "MEDIUM" | "HARD") => {
  switch (difficulty) {
    case "EASY":
      return "text-emerald-600 bg-emerald-50 border-emerald-200"
    case "MEDIUM":
      return "text-amber-600 bg-amber-50 border-amber-200"
    case "HARD":
      return "text-red-600 bg-red-50 border-red-200"
  }
}

const getStatusColor = (status: Quest["status"]) => {
  switch (status) {
    case "AVAILABLE":
      return "text-blue-700 bg-blue-100 border-blue-300"
    case "CLAIMED":
      return "text-orange-700 bg-orange-100 border-orange-300"
    case "COMPLETED":
      return "text-purple-700 bg-purple-100 border-purple-300"
    case "APPROVED":
      return "text-green-700 bg-green-100 border-green-300"
    case "REJECTED":
      return "text-red-700 bg-red-100 border-red-300"
    case "COOLDOWN":
      return "text-purple-700 bg-purple-100 border-purple-300"
  }
}

const getRoleTitle = (role: "ADMIN" | "EDITOR" | "PLAYER") => {
  switch (role) {
    case "ADMIN":
      return "Guild Master"
    case "EDITOR":
      return "Quest Giver"
    case "PLAYER":
      return "Adventurer"
  }
}

const formatTimeRemaining = (claimedAt: string, timeLimit: number = 48) => {
  const claimed = new Date(claimedAt)
  const deadline = new Date(claimed.getTime() + timeLimit * 60 * 60 * 1000)
  const now = new Date()
  const remaining = deadline.getTime() - now.getTime()

  if (remaining <= 0) return "Overdue"

  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Cooldown utility functions
const getCooldownTimeRemaining = (quest: Quest): string | null => {
  if (quest.status !== 'COOLDOWN' || !quest.lastCompletedAt || !quest.cooldownDays) {
    return null
  }

  const lastCompleted = new Date(quest.lastCompletedAt)
  const cooldownEnd = new Date(lastCompleted.getTime() + quest.cooldownDays * 24 * 60 * 60 * 1000)
  const now = new Date()
  const remaining = cooldownEnd.getTime() - now.getTime()

  if (remaining <= 0) return null

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h`
  return `${hours}h`
}

const formatCooldownPeriod = (cooldownDays: number): string => {
  if (cooldownDays === 1) return "1 day"
  if (cooldownDays < 7) return `${cooldownDays} days`
  if (cooldownDays === 7) return "1 week"
  if (cooldownDays < 14) return `${cooldownDays} days`
  if (cooldownDays === 14) return "2 weeks"
  if (cooldownDays < 30) return `${cooldownDays} days`
  if (cooldownDays === 30) return "1 month"
  return `${cooldownDays} days`
}

// Components
const QuestCard: React.FC<{
  quest: QuestWithExtras;
  onAction: (questId: number, action: string) => Promise<void>;
  currentUser: UserStats;
}> = ({ quest, onAction, currentUser }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [userSkillLevels, setUserSkillLevels] = useState<{[skillId: number]: number}>({})
  const [skillRequirementsLoaded, setSkillRequirementsLoaded] = useState(false)
  const [requiredSkills, setRequiredSkills] = useState<QuestRequiredSkill[]>([])

  const difficulty = quest.difficulty || getDifficultyFromBounty(quest.bounty)
  const timeLimit = quest.timeLimit || 48

  const isOverdue =
    quest.claimedAt &&
    new Date().getTime() > new Date(quest.claimedAt).getTime() + timeLimit * 60 * 60 * 1000

  // Load skill requirements and user skill levels when component mounts
  useEffect(() => {
    const loadSkillData = async () => {
      try {
        // Load skill requirements for this quest
        const skills = await skillService.getQuestRequiredSkills(quest.id);
        setRequiredSkills(skills);
        setSkillRequirementsLoaded(true);

        // Load user skill levels for required skills
        if (skills.length > 0) {
          const skillLevels: {[skillId: number]: number} = {};
          for (const requiredSkill of skills) {
            const level = await skillService.getUserSkillLevel(currentUser.id, requiredSkill.skillId);
            skillLevels[requiredSkill.skillId] = level;
          }
          setUserSkillLevels(skillLevels);
        }
      } catch (error) {
        console.error('Failed to load skill data:', error);
        setSkillRequirementsLoaded(true); // Mark as loaded even if failed
      }
    };

    loadSkillData();
  }, [quest.id, currentUser.id]);

  const handleAction = async (action: string) => {
    setActionLoading(action)
    try {
      await onAction(quest.id, action)
    } finally {
      setActionLoading(null)
    }
  }

  const getSkillRequirementStatus = (requiredSkill: QuestRequiredSkill) => {
    const userLevel = userSkillLevels[requiredSkill.skillId] || 0;
    const meetsRequirement = userLevel >= requiredSkill.minLevel;

    return {
      meetsRequirement,
      userLevel,
      requiredLevel: requiredSkill.minLevel,
      color: meetsRequirement ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
    };
  };

  const canClaimQuest = () => {
    if (quest.status !== 'AVAILABLE') return false;
    if (!skillRequirementsLoaded || requiredSkills.length === 0) return true;

    return requiredSkills.every(requiredSkill => {
      const userLevel = userSkillLevels[requiredSkill.skillId] || 0;
      return userLevel >= requiredSkill.minLevel;
    });
  };

  return (
    <Card className="relative overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-amber-400 opacity-60"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-amber-400 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-amber-400 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-amber-400 opacity-60"></div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-bold text-amber-900 leading-tight font-serif">{quest.title}</CardTitle>
          <div className="flex items-center gap-1 text-amber-700 font-bold">
            <Coins className="w-4 h-4" />
            <span>{quest.bounty}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge className={`text-xs font-medium border ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </Badge>
          <Badge className={`text-xs font-medium border ${getStatusColor(quest.status)}`}>
            {quest.status === "COMPLETED" ? "Pending Approval" :
              quest.status === "COOLDOWN" ? "On Cooldown" :
                quest.status.replace("_", " ")}
          </Badge>
          {quest.isRepeatable && (
            <Badge className="text-xs font-medium border text-purple-600 bg-purple-50 border-purple-200">
              🔄 Repeatable
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-amber-800 leading-relaxed">{quest.description}</p>

        {/* Skill Requirements */}
        {requiredSkills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
              <Target className="w-4 h-4" />
              <span>Required Skills:</span>
            </div>
            <div className="space-y-1">
              {requiredSkills.map((requiredSkill) => {
                const status = getSkillRequirementStatus(requiredSkill);
                return (
                  <div key={requiredSkill.skillId} className="flex items-center justify-between text-xs">
                    <span className="text-amber-700">{requiredSkill.skill?.name || `Skill ${requiredSkill.skillId}`}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-medium border ${status.color}`}>
                        Level {status.userLevel}/{status.requiredLevel}
                      </Badge>
                      {status.meetsRequirement ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <X className="w-3 h-3 text-red-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!skillRequirementsLoaded && quest.status === 'AVAILABLE' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-900">
              <Target className="w-4 h-4" />
              <span>Checking Requirements...</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-600"></div>
              <span className="text-xs text-amber-600">Loading skill requirements</span>
            </div>
          </div>
        )}

        <div className="space-y-2 text-xs text-amber-700">
          <div className="flex items-center gap-2">
            <Scroll className="w-3 h-3" />
            <span>Created by {quest.creatorName || `User ${quest.createdBy}`}</span>
          </div>

          {quest.claimerName && (
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Claimed by {quest.claimerName}</span>
            </div>
          )}

          {quest.claimedAt && quest.status === "CLAIMED" && (
            <div className={`flex items-center gap-2 ${isOverdue ? "text-red-600 font-bold" : ""}`}>
              <Clock className="w-3 h-3" />
              <span>
                {isOverdue ? "Overdue!" : `${formatTimeRemaining(quest.claimedAt, timeLimit)} remaining`}
              </span>
            </div>
          )}

          {quest.completedAt && ["COMPLETED", "APPROVED", "REJECTED"].includes(quest.status) && (
            <div className="flex items-center gap-2 text-green-600">
              <Trophy className="w-3 h-3" />
              <span>Completed: {new Date(quest.completedAt).toLocaleDateString()}</span>
            </div>
          )}

          {quest.status === "APPROVED" && (
            <div className="flex items-center gap-2 text-green-600 font-medium">
              <Check className="w-3 h-3" />
              <span>Approved - Bounty awarded!</span>
            </div>
          )}

          {quest.status === "REJECTED" && (
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <X className="w-3 h-3" />
              <span>Rejected</span>
            </div>
          )}

          {/* Repeat functionality information */}
          {quest.isRepeatable && (
            <>
              {quest.cooldownDays && (
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>Cooldown: {formatCooldownPeriod(quest.cooldownDays)}</span>
                </div>
              )}
              {quest.status === 'COOLDOWN' && (
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Available in: {getCooldownTimeRemaining(quest)}</span>
                </div>
              )}
              {quest.status === 'AVAILABLE' && quest.lastCompletedAt && (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <Check className="w-3 h-3" />
                  <span>Ready to repeat!</span>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {quest.status === "AVAILABLE" && (
            <Button
              onClick={() => handleAction("claim")}
              disabled={actionLoading === "claim" || !canClaimQuest()}
              className={`flex-1 font-medium ${
                canClaimQuest()
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
              size="sm"
            >
              <Sword className="w-4 h-4 mr-1" />
              {actionLoading === "claim" ? "Claiming..." :
               canClaimQuest() ? "Accept Quest" : "Skills Required"}
            </Button>
          )}

          {quest.status === "COOLDOWN" && (
            <Button
              disabled={true}
              className="flex-1 bg-gray-400 text-white font-medium cursor-not-allowed"
              size="sm"
            >
              <Clock className="w-4 h-4 mr-1" />
              On Cooldown
            </Button>
          )}

          {quest.status === "CLAIMED" && quest.claimerName === currentUser.name && (
            <Button
              onClick={() => handleAction("complete")}
              disabled={actionLoading === "complete"}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
              size="sm"
            >
              <Trophy className="w-4 h-4 mr-1" />
              {actionLoading === "complete" ? "Reporting..." : "Report Success"}
            </Button>
          )}

          {quest.status === "COMPLETED" && currentUser.role !== "PLAYER" && (
            <div className="flex gap-1 flex-1">
              <Button
                onClick={() => handleAction("approve")}
                disabled={actionLoading === "approve"}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                size="sm"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                disabled={actionLoading === "reject"}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Show completion status for approved/rejected quests */}
          {["APPROVED", "REJECTED"].includes(quest.status) && (
            <div className="flex-1 flex items-center justify-center">
              <Badge className={`text-xs font-medium border ${quest.status === "APPROVED"
                ? "text-green-600 bg-green-50 border-green-200"
                : "text-red-600 bg-red-50 border-red-200"
                }`}>
                {quest.status === "APPROVED" ? "✓ Completed" : "✗ Rejected"}
              </Badge>
            </div>
          )}

          <Button
            onClick={() => handleAction("view")}
            variant="outline"
            className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
            size="sm"
            title="View Quest Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const UserDashboard: React.FC<{ user: UserStats }> = ({ user }) => {
  const levelInfo = getLevelInfo(user.experience || 0)

  return (
    <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-amber-400">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-amber-200 text-amber-800 font-bold text-lg">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-amber-900 font-serif">{user.name}</h2>
            <p className="text-amber-700 font-medium">{getRoleTitle(user.role)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-amber-600" />
            <div className="text-lg font-bold text-amber-900">{user.completedQuests}</div>
            <div className="text-xs text-amber-700">Completed</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
            <Coins className="w-6 h-6 mx-auto mb-1 text-amber-600" />
            <div className="text-lg font-bold text-amber-900">{user.totalBounty}</div>
            <div className="text-xs text-amber-700">Total Bounty</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-amber-200">
            <Shield className="w-6 h-6 mx-auto mb-1 text-amber-600" />
            <div className="text-lg font-bold text-amber-900">{user.currentClaimed}</div>
            <div className="text-xs text-amber-700">Active Quests</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-2">Level {levelInfo.level}</h3>
          <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
            <div
              className="bg-amber-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(levelInfo.progressToNext * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-amber-700">
            {levelInfo.experience} / {levelInfo.experience + levelInfo.experienceToNext} XP
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const QuestBoard: React.FC = () => {
  const { user } = useAuth()
  const [quests, setQuests] = useState<QuestWithExtras[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("available")
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Convert user to UserStats format
  const currentUser: UserStats = useMemo(() => ({
    id: user?.id || 0,
    completedQuests: 0, // Will be fetched from API
    totalBounty: user?.bountyBalance || 0,
    currentClaimed: 0, // Will be calculated from quests
    role: user?.role || "PLAYER",
    name: user?.characterName || user?.name || "",
    avatar: user?.avatarUrl,
    experience: user?.experience
  }), [user])

  // Fetch quests from API
  const fetchQuests = async () => {
    try {
      setLoading(true)
      setError(null)

      let questData: QuestListingResponse

      console.log('Fetching quests for tab:', activeTab)

      switch (activeTab) {
        case "available":
          // Get all available quests including repeatable ones
          questData = await questService.getQuests({ status: "AVAILABLE,COOLDOWN" })
          break
        case "claimed":
          // Get claimed quests AND completed quests (pending approval) for current user
          questData = await questService.getMyClaimedQuests({ status: "CLAIMED,COMPLETED" })
          break
        case "completed":
          // Show user's own completed quests (approved/rejected)
          questData = await questService.getMyClaimedQuests({ status: "APPROVED,REJECTED" })
          break
        default:
          questData = await questService.getQuests()
      }

      console.log('Received quest data:', questData)

      // Check if the response has the expected structure
      if (!questData) {
        throw new Error('No data received from API')
      }

      // Handle different possible response structures
      let questArray: Quest[] = []

      if (questData.quests && Array.isArray(questData.quests)) {
        questArray = questData.quests
      } else if (Array.isArray(questData)) {
        // In case the API returns an array directly
        questArray = questData as Quest[]
      } else {
        console.warn('Unexpected API response structure:', questData)
        throw new Error('Invalid quest data format received from API')
      }

      // Transform API data to include extra fields
      const transformedQuests: QuestWithExtras[] = questArray.map(quest => ({
        ...quest,
        difficulty: getDifficultyFromBounty(quest.bounty),
        timeLimit: 48, // Default 48 hours
        creatorName: quest.creator?.characterName || quest.creator?.name,
        claimerName: quest.claimer?.characterName || quest.claimer?.name,
        requiredSkills: [] // Initialize empty, will be loaded on demand
      }));

      console.log('Transformed quests:', transformedQuests)
      setQuests(transformedQuests)
    } catch (err) {
      console.error('Failed to fetch quests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quests')
    } finally {
      setLoading(false)
    }
  }

  // Fetch quests on component mount and tab change
  useEffect(() => {
    fetchQuests()
  }, [activeTab])

  const filteredQuests = useMemo(() => {
    return quests.filter(
      (quest) =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quest.description && quest.description.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }, [quests, searchTerm])

  const handleQuestAction = async (questId: number, action: string) => {
    try {
      setError(null)

      switch (action) {
        case "claim":
          await questService.claimQuest(questId)
          break
        case "complete":
          await questService.completeQuest(questId)
          break
        case "approve":
          await questService.approveQuest(questId)
          break
        case "reject":
          await questService.rejectQuest(questId)
          break
        case "view":
          // Open quest details modal
          const questToView = quests.find(q => q.id === questId)
          if (questToView) {
            setSelectedQuest(questToView)
            setIsModalOpen(true)
          }
          return
        default:
          return
      }

      // Refresh quests after action
      await fetchQuests()
    } catch (err) {
      console.error(`Failed to ${action} quest:`, err)
      setError(err instanceof Error ? err.message : `Failed to ${action} quest`)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedQuest(null)
  }

  const handleModalAction = async (questId: number, action: string) => {
    try {
      await handleQuestAction(questId, action)
      // Close modal after successful action
      handleModalClose()
    } catch (err) {
      // Keep modal open if action fails
      console.error('Modal action failed:', err)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-600">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center">
              <Scroll className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-amber-900 font-serif">Quest Board</h1>
          </div>
          <p className="text-amber-700 text-lg">
            {currentUser.role === "ADMIN" || currentUser.role === "EDITOR"
              ? "Manage and oversee guild adventures"
              : "Choose your next adventure"}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <UserDashboard user={currentUser} />

            {/* Search */}
            <Card className="border-2 border-amber-200 bg-white shadow-md">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-4 h-4" />
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-amber-100 border border-amber-300">
                <TabsTrigger
                  value="available"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium"
                >
                  Available Quests
                </TabsTrigger>
                <TabsTrigger
                  value="claimed"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium"
                >
                  My Quests
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white font-medium"
                >
                  Completed
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <Card className="border-2 border-red-200 bg-red-50 shadow-md">
                    <CardContent className="p-4">
                      <div className="text-red-800 font-medium">Error: {error}</div>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {loading ? (
                  <Card className="border-2 border-amber-200 bg-white shadow-md">
                    <CardContent className="p-12 text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-amber-900 mb-2">Loading Quests</h3>
                      <p className="text-amber-700">Gathering available adventures...</p>
                    </CardContent>
                  </Card>
                ) : filteredQuests.length === 0 ? (
                  <Card className="border-2 border-amber-200 bg-white shadow-md">
                    <CardContent className="p-12 text-center">
                      <Scroll className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                      <h3 className="text-xl font-bold text-amber-900 mb-2">No Quests Found</h3>
                      <p className="text-amber-700">
                        {searchTerm ? "Try adjusting your search terms." : "No quests available in this category."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredQuests.map((quest) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        onAction={handleQuestAction}
                        currentUser={currentUser}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Quest Details Modal */}
        <QuestDetailsModal
          quest={selectedQuest}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onAction={handleModalAction}
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}

export default QuestBoard
