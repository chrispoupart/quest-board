import React, { useState, useMemo } from "react"
import { Search, Sword, Shield, Coins, Clock, Scroll, Trophy, ChevronDown, Plus, Check, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// TypeScript Interfaces
interface Quest {
  id: number
  title: string
  description: string
  bounty: number
  difficulty: "EASY" | "MEDIUM" | "HARD"
  status: "AVAILABLE" | "CLAIMED" | "COMPLETED" | "APPROVED" | "REJECTED"
  createdBy: string
  claimedBy?: string
  claimedAt?: string
  completedAt?: string
  createdAt: string
  timeLimit?: number // hours
}

interface UserStats {
  completedQuests: number
  totalBounty: number
  currentClaimed: number
  role: "ADMIN" | "EDITOR" | "PLAYER"
  name: string
  avatar?: string
}

// Sample Data
const sampleQuests: Quest[] = [
  {
    id: 1,
    title: "The Great Kitchen Cleansing",
    description:
      "Remove all traces of the feast from the kitchen chambers. Scrub all surfaces until they gleam like elvish silver. Pay special attention to the mystical cooking apparatus.",
    bounty: 25,
    difficulty: "MEDIUM",
    status: "AVAILABLE",
    createdBy: "Guild Master Sarah",
    createdAt: "2024-01-15",
    timeLimit: 24,
  },
  {
    id: 2,
    title: "Laundry Dragon Defeat",
    description:
      "Vanquish the growing pile of cloth armor in the washing chambers. Sort by color and material type to prevent magical contamination.",
    bounty: 15,
    difficulty: "EASY",
    status: "CLAIMED",
    claimedBy: "Adventurer Mike",
    claimedAt: "2024-01-16T10:00:00Z",
    createdBy: "Quest Giver Emma",
    createdAt: "2024-01-14",
    timeLimit: 12,
  },
  {
    id: 3,
    title: "Garden of Gondor Restoration",
    description:
      "Tend to the sacred gardens behind the stronghold. Remove weeds, water the ancient plants, and restore the pathways to their former glory.",
    bounty: 35,
    difficulty: "HARD",
    status: "COMPLETED",
    claimedBy: "Ranger Tom",
    completedAt: "2024-01-15T14:30:00Z",
    createdBy: "Guild Master Sarah",
    createdAt: "2024-01-12",
    timeLimit: 48,
  },
  {
    id: 4,
    title: "Dust Bunny Extermination",
    description:
      "Clear the living quarters of all dust creatures that have taken residence under furniture and in forgotten corners.",
    bounty: 10,
    difficulty: "EASY",
    status: "AVAILABLE",
    createdBy: "Quest Giver Emma",
    createdAt: "2024-01-16",
    timeLimit: 6,
  },
  {
    id: 5,
    title: "Bathroom Fortress Maintenance",
    description:
      "Restore the cleanliness and order to the washing chambers. Ensure all surfaces are pristine and supplies are well-stocked.",
    bounty: 20,
    difficulty: "MEDIUM",
    status: "APPROVED",
    claimedBy: "Adventurer Lisa",
    completedAt: "2024-01-14T16:00:00Z",
    createdBy: "Guild Master Sarah",
    createdAt: "2024-01-13",
    timeLimit: 18,
  },
]

const currentUser: UserStats = {
  completedQuests: 12,
  totalBounty: 340,
  currentClaimed: 2,
  role: "PLAYER",
  name: "Adventurer Mike",
  avatar: "/placeholder.svg?height=40&width=40",
}

// Utility Functions
const getDifficultyColor = (difficulty: Quest["difficulty"]) => {
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
  }
}

const getRoleTitle = (role: UserStats["role"]) => {
  switch (role) {
    case "ADMIN":
      return "Guild Master"
    case "EDITOR":
      return "Quest Giver"
    case "PLAYER":
      return "Adventurer"
  }
}

const formatTimeRemaining = (claimedAt: string, timeLimit: number) => {
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

// Components
const QuestCard: React.FC<{ quest: Quest; onAction: (questId: number, action: string) => void }> = ({
  quest,
  onAction,
}) => {
  const isOverdue =
    quest.claimedAt &&
    quest.timeLimit &&
    new Date().getTime() > new Date(quest.claimedAt).getTime() + quest.timeLimit * 60 * 60 * 1000

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
          <Badge className={`text-xs font-medium border ${getDifficultyColor(quest.difficulty)}`}>
            {quest.difficulty}
          </Badge>
          <Badge className={`text-xs font-medium border ${getStatusColor(quest.status)}`}>
            {quest.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-amber-800 leading-relaxed">{quest.description}</p>

        <div className="space-y-2 text-xs text-amber-700">
          <div className="flex items-center gap-2">
            <Scroll className="w-3 h-3" />
            <span>Created by {quest.createdBy}</span>
          </div>

          {quest.claimedBy && (
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Claimed by {quest.claimedBy}</span>
            </div>
          )}

          {quest.claimedAt && quest.timeLimit && quest.status === "CLAIMED" && (
            <div className={`flex items-center gap-2 ${isOverdue ? "text-red-600 font-bold" : ""}`}>
              <Clock className="w-3 h-3" />
              <span>
                {isOverdue ? "Overdue!" : `${formatTimeRemaining(quest.claimedAt, quest.timeLimit)} remaining`}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {quest.status === "AVAILABLE" && (
            <Button
              onClick={() => onAction(quest.id, "claim")}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium"
              size="sm"
            >
              <Sword className="w-4 h-4 mr-1" />
              Accept Quest
            </Button>
          )}

          {quest.status === "CLAIMED" && quest.claimedBy === currentUser.name && (
            <Button
              onClick={() => onAction(quest.id, "complete")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
              size="sm"
            >
              <Trophy className="w-4 h-4 mr-1" />
              Report Success
            </Button>
          )}

          {quest.status === "COMPLETED" && currentUser.role !== "PLAYER" && (
            <div className="flex gap-1 flex-1">
              <Button
                onClick={() => onAction(quest.id, "approve")}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                size="sm"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onAction(quest.id, "reject")}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={() => onAction(quest.id, "view")}
            variant="outline"
            className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50"
            size="sm"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

const UserDashboard: React.FC<{ user: UserStats }> = ({ user }) => {
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
      </CardContent>
    </Card>
  )
}

const QuestBoard: React.FC = () => {
  const [quests, setQuests] = useState<Quest[]>(sampleQuests)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("available")

  const filteredQuests = useMemo(() => {
    const filtered = quests.filter(
      (quest) =>
        quest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quest.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    switch (activeTab) {
      case "available":
        return filtered.filter((q) => q.status === "AVAILABLE")
      case "claimed":
        return filtered.filter((q) => q.claimedBy === currentUser.name)
      case "completed":
        return filtered.filter((q) => ["COMPLETED", "APPROVED", "REJECTED"].includes(q.status))
      default:
        return filtered
    }
  }, [quests, searchTerm, activeTab])

  const handleQuestAction = (questId: number, action: string) => {
    setQuests((prev) =>
      prev.map((quest) => {
        if (quest.id === questId) {
          switch (action) {
            case "claim":
              return {
                ...quest,
                status: "CLAIMED" as const,
                claimedBy: currentUser.name,
                claimedAt: new Date().toISOString(),
              }
            case "complete":
              return {
                ...quest,
                status: "COMPLETED" as const,
                completedAt: new Date().toISOString(),
              }
            case "approve":
              return { ...quest, status: "APPROVED" as const }
            case "reject":
              return { ...quest, status: "REJECTED" as const }
            case "view":
              // Handle view action (could open modal)
              console.log("Viewing quest:", quest)
              return quest
            default:
              return quest
          }
        }
        return quest
      }),
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* Header */}
      <header className="border-b-4 border-amber-300 bg-gradient-to-r from-amber-200 to-yellow-200 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center">
                <Scroll className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-amber-900 font-serif">Quest Board</h1>
            </div>

            <div className="flex items-center gap-4">
              {(currentUser.role === "ADMIN" || currentUser.role === "EDITOR") && (
                <Button className="bg-amber-600 hover:bg-amber-700 text-white font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quest
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white border-amber-300 text-amber-700 hover:bg-amber-50">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                      <AvatarFallback className="bg-amber-200 text-amber-800 text-xs">
                        {currentUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {currentUser.name}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
                {filteredQuests.length === 0 ? (
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
                      <QuestCard key={quest.id} quest={quest} onAction={handleQuestAction} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestBoard
