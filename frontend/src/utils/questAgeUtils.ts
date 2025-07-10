// Utility functions for quest age logic (Jira-style dots)
import { Quest } from "../types"

export function getQuestAgeReference(quest: Quest): string {
  // For repeatable quests, use lastCompletedAt if present, otherwise createdAt
  if (quest.isRepeatable && quest.lastCompletedAt) {
    return quest.lastCompletedAt
  }
  return quest.createdAt
}

export function getQuestAgeDots(quest: Quest): number {
  const refDate = new Date(getQuestAgeReference(quest))
  const now = new Date()
  const diffInDays = (now.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)
  if (diffInDays <= 3) return 0
  if (diffInDays <= 7) return 1
  if (diffInDays <= 10) return 2
  if (diffInDays <= 14) return 3
  return 4
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (isNaN(diffInSeconds)) return ''
  if (diffInSeconds < 60) return 'Just now'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  return `${Math.floor(diffInDays / 30)}mo ago`
} 
