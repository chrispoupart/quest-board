-- CreateTable
CREATE TABLE "RewardConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "monthlyBountyReward" REAL NOT NULL DEFAULT 0,
    "monthlyQuestReward" REAL NOT NULL DEFAULT 0,
    "quarterlyCollectiveGoal" REAL NOT NULL DEFAULT 0,
    "quarterlyCollectiveReward" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
