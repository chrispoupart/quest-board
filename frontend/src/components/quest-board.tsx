import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, Sword, Shield, Coins, Clock, Scroll, Trophy, Check, X, Eye, Target } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Pagination } from "../components/ui/pagination"
import QuestDetailsModal from "./QuestDetailsModal"
import { getLevelInfo } from "../utils/leveling"
import { skillService } from "../services/skillService"

import { useAuth } from "../contexts/AuthContext"
import { questService } from "../services/questService"
import { Quest, QuestListingResponse, QuestRequiredSkill } from "../types"
import QuestEditModal from "./QuestEditModal"
import { dashboardService } from "../services/dashboardService"
import { getQuestAgeReference, getQuestAgeDots, formatTimeAgo } from "../utils/questAgeUtils"

// TypeScript Interfaces (extended from the API types)
interface QuestWithExtras extends Quest {
  difficulty?: "EASY" | "MEDIUM" | "HARD"
  timeLimit?: number // hours
  creatorName?: string
  claimerName?: string
  requiredSkills?: QuestRequiredSkill[]
  rejectionReason?: string
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
  // Using more theme-neutral colors for now, can be customized further in index.css if needed
  switch (difficulty) {
    case "EASY":
      return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
    case "MEDIUM":
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700"
    case "HARD":
      return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700"
  }
}

const getStatusColor = (status: Quest["status"]) => {
  switch (status) {
    case "AVAILABLE":
      return "text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700"
    case "CLAIMED":
      return "text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700"
    case "COMPLETED":
      return "text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700"
    case "APPROVED":
      return "text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700"
    case "REJECTED":
      return "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700"
    case "COOLDOWN":
      return "text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
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

// Update getCooldownTimeRemaining to show min/sec fallback
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
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000)
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
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
  allQuests: QuestWithExtras[];
}> = ({ quest, onAction, currentUser }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [userSkillLevels, setUserSkillLevels] = useState<{[skillId: number]: number}>({})
  const [skillRequirementsLoaded, setSkillRequirementsLoaded] = useState(false)
  const [requiredSkills, setRequiredSkills] = useState<QuestRequiredSkill[]>([])
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [cloneModalOpen, setCloneModalOpen] = useState(false)

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
        const skills = await skillService.getQuestSkillRequirements(quest.id);
        setRequiredSkills(skills);
        setSkillRequirementsLoaded(true);

        // Load user skill levels for required skills
        if (skills.length > 0) {
          const skillLevels: {[skillId: number]: number} = {};
          for (const requiredSkill of skills) {
            const level = await skillService.getMySkillLevel(requiredSkill.skillId);
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
      color: meetsRequirement ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700' : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700'
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

  // Assigned user display logic
  const assignedUser = (quest as any).personalizedFor;
  const assignedUserId = (quest as any).userId;

  // Claimer display logic
  const claimer = (quest as any).claimer;
  const claimedById = (quest as any).claimedBy;

  return (
    <Card className="relative overflow-hidden border-2 border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary opacity-60"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary opacity-60"></div>

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-foreground leading-tight font-serif">{quest.title}</CardTitle>
            {/* Age dots */}
            <span className="flex items-center ml-1" title={formatTimeAgo(getQuestAgeReference(quest))}>
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className={`inline-block w-2 h-2 rounded-full mx-0.5 ${i < getQuestAgeDots(quest) ? 'bg-gray-500 dark:bg-gray-300' : 'bg-gray-300 dark:bg-gray-700 opacity-40'}`}
                  style={{ transition: 'background 0.2s' }}
                />
              ))}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground font-bold">
              <Coins className="w-4 h-4" />
              <span>{quest.bounty}</span>
            </div>
            {/* Age badge removed, replaced by dots */}
            {(currentUser.role === "ADMIN" || currentUser.role === "EDITOR") && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  onClick={e => { e.stopPropagation(); setEditModalOpen(true); }}
                  title="Edit Quest"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1"
                  onClick={e => { e.stopPropagation(); setCloneModalOpen(true); }}
                  title="Clone Quest"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg>
                </Button>
              </div>
            )}
          </div>
        </div>
        {/* Claimer info for everyone */}
        {(claimer || claimedById) && (
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="font-medium">Claimed by:</span>
            {claimer ? (
              <>
                {claimer.avatarUrl && (
                  <img src={claimer.avatarUrl} alt={claimer.characterName || claimer.name} className="w-5 h-5 rounded-full inline-block mr-1" />
                )}
                <span>{claimer.characterName || claimer.name || `User #${claimer.id}`}</span>
              </>
            ) : (
              <span>User #{claimedById}</span>
            )}
          </div>
        )}
        {/* Assigned user info for permitted users */}
        {(currentUser.role === "ADMIN" || currentUser.role === "EDITOR") && (assignedUser || assignedUserId) && (
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="font-medium">Assigned to:</span>
            {assignedUser ? (
              <>
                {assignedUser.avatarUrl && (
                  <img src={assignedUser.avatarUrl} alt={assignedUser.characterName || assignedUser.name} className="w-5 h-5 rounded-full inline-block mr-1" />
                )}
                <span>{assignedUser.characterName || assignedUser.name || `User #${assignedUser.id}`}</span>
              </>
            ) : (
              <span>User #{assignedUserId}</span>
            )}
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <Badge className={`text-xs font-medium border ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </Badge>
          <Badge className={`text-xs font-medium border ${getStatusColor(quest.status)}`}>
            {quest.status === "COMPLETED" ? "Pending Approval" :
              quest.status === "COOLDOWN" ? "On Cooldown" :
                (quest as any)._displayStatus === 'COMPLETED_REPEATABLE' ? "Completed" :
                  (quest as any)._displayStatus === 'COMPLETED_HISTORY' ? "Completed" :
                    quest.status.replace("_", " ")}
          </Badge>
          {quest.isRepeatable && (
            <Badge className="text-xs font-medium border text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700">
              🔄 Repeatable
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-foreground leading-relaxed">{quest.description}</p>

        {/* Show rejection reason for in-progress (claimed) quests */}
        {quest.status === 'CLAIMED' && quest.rejectionReason && currentUser.id === quest.claimedBy && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded p-3 text-sm text-red-700 dark:text-red-200 mb-2">
            <X className="inline w-4 h-4 mr-1 align-text-bottom" />
            <span className="font-semibold">Rejected:</span> {quest.rejectionReason}
          </div>
        )}

        {/* Skill Requirements */}
        {requiredSkills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="w-4 h-4" />
              <span>Required Skills:</span>
            </div>
            <div className="space-y-1">
              {requiredSkills.map((requiredSkill) => {
                const status = getSkillRequirementStatus(requiredSkill);
                return (
                  <div key={requiredSkill.skillId} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{requiredSkill.skill?.name || `Skill ${requiredSkill.skillId}`}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs font-medium border ${status.color}`}>
                        Level {status.userLevel}/{status.requiredLevel}
                      </Badge>
                      {status.meetsRequirement ? (
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-600 dark:text-red-400" />
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
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="w-4 h-4" />
              <span>Checking Requirements...</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              <span className="text-xs text-primary">Loading skill requirements</span>
            </div>
          </div>
        )}

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Scroll className="w-3 h-3" />
            <span>Created by {quest.creatorName || `User ${quest.createdBy}`}</span>
          </div>

          {/* Due date display */}
          {quest.dueDate && (
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>Due: {new Date(quest.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {quest.claimerName && (
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Claimed by {quest.claimerName}</span>
            </div>
          )}

          {quest.claimedAt && quest.status === "CLAIMED" && (
            <div className={`flex items-center gap-2 ${isOverdue ? "text-red-600 dark:text-red-400 font-bold" : ""}`}>
              <Clock className="w-3 h-3" />
              <span>
                {isOverdue ? "Overdue!" : `${formatTimeRemaining(quest.claimedAt, timeLimit)} remaining`}
              </span>
            </div>
          )}

          {quest.completedAt && ["COMPLETED", "APPROVED", "REJECTED"].includes(quest.status) && !(quest as any)._displayStatus && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Trophy className="w-3 h-3" />
              <span>Completed: {new Date(quest.completedAt).toLocaleDateString()}</span>
            </div>
          )}

          {/* Handle repeatable quests that have been reset but were completed */}
          {(quest as any)._displayStatus === 'COMPLETED_REPEATABLE' && (quest as any)._completionDate && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Trophy className="w-3 h-3" />
              <span>Completed: {new Date((quest as any)._completionDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Handle quests from completion history */}
          {(quest as any)._displayStatus === 'COMPLETED_HISTORY' && (quest as any)._completionDate && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Trophy className="w-3 h-3" />
              <span>Completed: {new Date((quest as any)._completionDate).toLocaleDateString()}</span>
            </div>
          )}

          {quest.status === "APPROVED" && !(quest as any)._displayStatus && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <Check className="w-3 h-3" />
              <span>Approved - Bounty awarded!</span>
            </div>
          )}

          {/* Handle repeatable quests that have been reset but were approved */}
          {(quest as any)._displayStatus === 'COMPLETED_REPEATABLE' && (quest as any)._approvalStatus === 'APPROVED' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <Check className="w-3 h-3" />
              <span>Approved - Bounty awarded!</span>
            </div>
          )}

          {/* Handle quests from completion history */}
          {(quest as any)._displayStatus === 'COMPLETED_HISTORY' && (quest as any)._approvalStatus === 'APPROVED' && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <Check className="w-3 h-3" />
              <span>Approved - Bounty awarded!</span>
            </div>
          )}

          {quest.status === "REJECTED" && !(quest as any)._displayStatus && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
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
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>Available in: {getCooldownTimeRemaining(quest)}</span>
                </div>
              )}
              {quest.status === 'AVAILABLE' && quest.lastCompletedAt && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
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
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              size="sm"
            >
              <Sword className="w-4 h-4 mr-1" />
              {actionLoading === "claim" ? "Claiming..." :
               canClaimQuest() ? "Accept Quest" : "Skills Required"}
            </Button>
          )}

          {quest.status === "COOLDOWN" && (
            <div className="flex gap-1 flex-1">
              <Button
                disabled={true}
                className="flex-1 bg-muted text-muted-foreground font-medium cursor-not-allowed"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                On Cooldown
              </Button>
              {currentUser.role === "ADMIN" && (
                <Button
                  onClick={() => handleAction("reset")}
                  disabled={actionLoading === "reset"}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white dark:text-blue-100 font-medium"
                  size="sm"
                  title="Reset quest to available immediately"
                >
                  <Clock className="w-4 h-4" />
                  {actionLoading === "reset" ? "Resetting..." : "Reset"}
                </Button>
              )}
            </div>
          )}

          {quest.status === "CLAIMED" && currentUser.id === quest.claimedBy && (
            <Button
              onClick={() => handleAction("complete")}
              disabled={actionLoading === "complete"}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white dark:text-green-100 font-medium"
              size="sm"
            >
              <Trophy className="w-4 h-4 mr-1" />
              {actionLoading === "complete" ? "Reporting..." : "Report Success"}
            </Button>
          )}

          {/* Admin/Editor approval buttons for completed quests */}
          {quest.status === "COMPLETED" && (currentUser.role === "ADMIN" || currentUser.role === "EDITOR") && (
            <div className="flex gap-1 flex-1">
              <Button
                onClick={() => handleAction("approve")}
                disabled={actionLoading === "approve"}
                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white dark:text-green-100 font-medium"
                size="sm"
              >
                <Check className="w-4 h-4" />
                {actionLoading === "approve" ? "Approving..." : "Approve"}
              </Button>
              <Button
                onClick={() => handleAction("reject")}
                disabled={actionLoading === "reject"}
                className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white dark:text-red-100 font-medium"
                size="sm"
              >
                <X className="w-4 h-4" />
                {actionLoading === "reject" ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          )}

          {/* Show completion status for approved/rejected quests */}
          {["APPROVED", "REJECTED"].includes(quest.status) && !(quest as any)._displayStatus && (
            <div className="flex-1 flex items-center justify-center">
              <Badge className={`text-xs font-medium border ${quest.status === "APPROVED"
                ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700"
                : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700"
                }`}>
                {quest.status === "APPROVED" ? "✓ Completed" : "✗ Rejected"}
              </Badge>
            </div>
          )}

          {/* Show completion status for repeatable quests that have been reset */}
          {(quest as any)._displayStatus === 'COMPLETED_REPEATABLE' && (
            <div className="flex-1 flex items-center justify-center">
              <Badge className="text-xs font-medium border text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700">
                ✓ Completed
              </Badge>
            </div>
          )}

          {/* Show completion status for quests from completion history */}
          {(quest as any)._displayStatus === 'COMPLETED_HISTORY' && (
            <div className="flex-1 flex items-center justify-center">
              <Badge className={`text-xs font-medium border ${(quest as any)._approvalStatus === "APPROVED"
                ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-700"
                : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-700"
                }`}>
                {(quest as any)._approvalStatus === "APPROVED" ? "✓ Completed" : "✗ Rejected"}
              </Badge>
            </div>
          )}

          <Button
            onClick={() => handleAction("view")}
            variant="outline"
            className="bg-muted/50 hover:bg-muted" // Adjusted for subtle background in both modes
            size="sm"
            title="View Quest Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>

      {/* Edit Modal */}
      {(currentUser.role === "ADMIN" || currentUser.role === "EDITOR") && (
        <>
          <QuestEditModal
            quest={quest}
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={() => window.location.reload()} // or trigger a refetch if available
          />
          {/* Clone Modal: pass a new quest object with fields copied from the original, but no id/status/claimed/assigned/timestamps */}
          <QuestEditModal
            quest={cloneModalOpen ? {
              title: quest.title,
              description: quest.description,
              bounty: quest.bounty,
              status: 'AVAILABLE',
              isRepeatable: quest.isRepeatable,
              cooldownDays: quest.cooldownDays,
              // Do not include id, claimedBy, claimedAt, completedAt, createdAt, updatedAt, creator, claimer, userId, lastCompletedAt
            } as any : null}
            isOpen={cloneModalOpen}
            onClose={() => setCloneModalOpen(false)}
            onSave={() => window.location.reload()} // or trigger a refetch if available
          />
        </>
      )}
    </Card>
  )
}

const UserDashboard: React.FC<{ user: UserStats }> = ({ user }) => {
  const levelInfo = getLevelInfo(user.experience || 0)

  return (
    <Card className="border-2 border-border bg-card shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="w-16 h-16 border-2 border-primary">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground font-serif">{user.name}</h2>
            <p className="text-muted-foreground font-medium">{getRoleTitle(user.role)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{user.completedQuests}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <Coins className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{user.totalBounty}</div>
            <div className="text-xs text-muted-foreground">Total Bounty</div>
          </div>
          <div className="text-center p-3 bg-background rounded-lg border border-border">
            <Shield className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold text-foreground">{user.currentClaimed}</div>
            <div className="text-xs text-muted-foreground">Active Quests</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-background rounded-lg border border-border">
          <h3 className="text-sm font-bold text-foreground mb-2">Level {levelInfo.level}</h3>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(levelInfo.progressToNext * 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {levelInfo.experience} / {levelInfo.experience + levelInfo.experienceToNext} XP
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

const QuestBoard: React.FC = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [quests, setQuests] = useState<QuestWithExtras[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("available")
  const [error, setError] = useState<string | null>(null)

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState<{ completedQuests: number; totalBounty: number; currentQuests: number }>({ completedQuests: 0, totalBounty: 0, currentQuests: 0 });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalQuests, setTotalQuests] = useState(0)
  const [pageSize] = useState(12) // Show 12 quests per page (3 columns x 4 rows)

  // Modal state
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Convert user to UserStats format, but use dashboardStats for completed/current/bounty
  const currentUser: UserStats = useMemo(() => ({
    id: user?.id || 0,
    completedQuests: dashboardStats.completedQuests,
    totalBounty: dashboardStats.totalBounty || user?.bountyBalance || 0,
    currentClaimed: dashboardStats.currentQuests,
    role: user?.role || "PLAYER",
    name: user?.characterName || user?.name || "",
    avatar: user?.avatarUrl,
    experience: user?.experience
  }), [user, dashboardStats])

  // Handle URL parameters on mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  // Fetch dashboard stats on mount
  useEffect(() => {
    if (!user) return;
    dashboardService.getUserDashboard().then(data => {
      setDashboardStats({
        completedQuests: data.stats.completedQuests,
        totalBounty: data.stats.totalBounty,
        currentQuests: data.stats.currentQuests
      });
    }).catch(() => {
      setDashboardStats({ completedQuests: 0, totalBounty: user?.bountyBalance || 0, currentQuests: 0 });
    });
  }, [user]);

  // Fetch quests from API
  const fetchQuests = async (page: number = 1) => {
    try {
      console.log('Starting fetchQuests for page:', page, 'activeTab:', activeTab, 'searchTerm:', searchTerm)
      setLoading(true)
      setError(null)

      let questData: QuestListingResponse

      // console.log('Fetching quests for tab:', activeTab, 'page:', page, 'search:', searchTerm)

      const params = {
        page,
        limit: pageSize,
        ...(searchTerm && { search: searchTerm })
      }

      console.log('API params:', params)

      switch (activeTab) {
        case "available":
          // Get all available quests including repeatable ones
          questData = await questService.getQuests({
            status: "AVAILABLE,COOLDOWN",
            ...params
          })
          break
        case "claimed":
          // Get claimed quests AND completed quests (pending approval) for current user
          questData = await questService.getMyClaimedQuests({
            status: "CLAIMED,COMPLETED",
            ...params
          })
          break
        case "pending":
          // Get quests pending approval (for admins/editors)
          questData = await questService.getQuests({
            status: "PENDING_APPROVAL",
            ...params
          })
          break
        case "completed":
          // Show user's own completed quests (approved/rejected) and repeatable quests that have been reset
          questData = await questService.getMyCompletionHistory({
            ...params
          })
          break
        default:
          questData = await questService.getQuests(params)
      }

      console.log('API response:', questData)

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
        // console.warn('Unexpected API response structure:', questData)
        throw new Error('Invalid quest data format received from API')
      }

      // Transform API data to include extra fields
      const transformedQuests: QuestWithExtras[] = questArray.map(quest => ({
        ...quest,
        difficulty: getDifficultyFromBounty(quest.bounty),
        timeLimit: 48, // Default 48 hours
        creatorName: quest.creator?.characterName || quest.creator?.name,
        claimerName: quest.claimer?.characterName || quest.claimer?.name,
        requiredSkills: [], // Initialize empty, will be loaded on demand
        rejectionReason: undefined // Initialize rejectionReason as undefined
      }));

      console.log('Transformed quests count:', transformedQuests.length)
      setQuests(transformedQuests)

      // Update pagination state
      if (questData.pagination) {
        console.log('Pagination data:', questData.pagination)
        // This is important to sync with server-side state, e.g., if requested page is out of bounds
        if (questData.pagination.page !== currentPage) {
            console.log('Server returned different page than requested. Server:', questData.pagination.page, 'Requested:', currentPage)
            setCurrentPage(questData.pagination.page)
        }
        setTotalPages(questData.pagination.totalPages)
        setTotalQuests(questData.pagination.total)
      }
    } catch (err) {
      console.error('Failed to fetch quests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quests')
    } finally {
      setLoading(false)
    }
  }

  // Fetch quests when currentPage or activeTab changes.
  // The logic inside handles resetting page for tab changes.
  useEffect(() => {
    console.log('Fetching quests for page:', currentPage, 'tab:', activeTab, 'search:', searchTerm)
    fetchQuests(currentPage)
  }, [currentPage, activeTab, searchTerm])

  // Reset to page 1 when active tab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(1)
      // Update URL with search term
      if (searchTerm) {
        setSearchParams({ search: searchTerm });
      } else {
        setSearchParams({});
      }
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm, setSearchParams])


  // Handle page changes
  const handlePageChange = (page: number) => {
    console.log('Page change requested:', page, 'current page:', currentPage)
    if (page !== currentPage) {
      setCurrentPage(page)
    }
  }

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
        case "reset":
          await questService.resetRepeatableQuest(questId)
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
      await fetchQuests(currentPage)
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">Loading your adventure...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Scroll className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground font-serif">Quest Board</h1>
          </div>
          <p className="text-muted-foreground text-lg">
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
            <Card className="border-2 border-border bg-card shadow-md">
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search quests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border focus:border-ring focus:ring-ring"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Mobile Dropdown */}
              <div className="block md:hidden mb-4">
                <select
                  className="w-full rounded px-3 py-2 border border-border bg-background text-foreground"
                  value={activeTab}
                  onChange={e => setActiveTab(e.target.value)}
                >
                  <option value="available">Available Quests</option>
                  <option value="claimed">My Quests</option>
                  {(currentUser.role === "ADMIN" || currentUser.role === "EDITOR") && (
                    <option value="pending">Pending Approval</option>
                  )}
                  <option value="completed">Completed</option>
                </select>
              </div>
              <TabsList className={`hidden md:grid w-full ${(currentUser.role === "ADMIN" || currentUser.role === "EDITOR") ? 'grid-cols-4' : 'grid-cols-3'} bg-muted border border-border text-muted-foreground`}>
                <TabsTrigger
                  value="available"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  Available Quests
                </TabsTrigger>
                <TabsTrigger
                  value="claimed"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  My Quests
                </TabsTrigger>
                {(currentUser.role === "ADMIN" || currentUser.role === "EDITOR") && (
                  <TabsTrigger
                    value="pending"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                  >
                    Pending Approval
                  </TabsTrigger>
                )}
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium"
                >
                  Completed
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <Card className="border-2 border-destructive bg-destructive/10 shadow-md">
                    <CardContent className="p-4">
                      <div className="text-destructive font-medium">Error: {error}</div>
                    </CardContent>
                  </Card>
                )}

                {/* Loading State */}
                {loading ? (
                  <Card className="border-2 border-border bg-card shadow-md">
                    <CardContent className="p-12 text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                      <h3 className="text-xl font-bold text-foreground mb-2">Loading Quests</h3>
                      <p className="text-muted-foreground">Gathering available adventures...</p>
                    </CardContent>
                  </Card>
                ) : quests.length === 0 ? (
                  <Card className="border-2 border-border bg-card shadow-md">
                    <CardContent className="p-12 text-center">
                      <Scroll className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-bold text-foreground mb-2">No Quests Found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm ? "Try adjusting your search terms." : "No quests available in this category."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Quest Count */}
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-muted-foreground font-medium">
                        Showing {quests.length} of {totalQuests} quests
                      </p>
                    </div>

                    {/* Quest Cards Grid */}
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {quests
                        .slice() // avoid mutating state
                        .sort((a, b) => new Date(getQuestAgeReference(a)).getTime() - new Date(getQuestAgeReference(b)).getTime())
                        .map((quest) => (
                          <QuestCard
                            key={quest.id}
                            quest={quest}
                            onAction={handleQuestAction}
                            currentUser={currentUser}
                            allQuests={quests}
                          />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      className="mt-8"
                    />
                  </>
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
