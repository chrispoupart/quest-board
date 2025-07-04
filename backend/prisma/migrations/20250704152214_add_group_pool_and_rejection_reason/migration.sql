-- AlterTable
ALTER TABLE "QuestCompletion" ADD COLUMN "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "GroupPool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pool" REAL NOT NULL DEFAULT 0
);
