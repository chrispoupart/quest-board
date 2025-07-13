/*
  Warnings:

  - You are about to alter the column `title` on the `quests` table. The data in that column could be lost. The data in that column will be cast from `String` to `Unsupported("TEXT COLLATE NOCASE")`.
  - You are about to alter the column `description` on the `quests` table. The data in that column could be lost. The data in that column will be cast from `String` to `Unsupported("TEXT COLLATE NOCASE")`.

*/
-- Create new table with COLLATE NOCASE
CREATE TABLE "new_quests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL COLLATE NOCASE,
    "description" TEXT COLLATE NOCASE,
    "bounty" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_by" INTEGER NOT NULL,
    "claimed_by" INTEGER,
    "claimed_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "due_date" DATETIME,
    "user_id" INTEGER,
    "is_repeatable" BOOLEAN NOT NULL DEFAULT false,
    "cooldown_days" INTEGER,
    "last_completed_at" DATETIME,
    CONSTRAINT "quests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quests_claimed_by_fkey" FOREIGN KEY ("claimed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from old table to new table
INSERT INTO "new_quests" ("id", "title", "description", "bounty", "status", "created_by", "claimed_by", "claimed_at", "completed_at", "created_at", "updated_at", "due_date", "user_id", "is_repeatable", "cooldown_days", "last_completed_at")
SELECT "id", "title", "description", "bounty", "status", "created_by", "claimed_by", "claimed_at", "completed_at", "created_at", "updated_at", "due_date", "user_id", "is_repeatable", "cooldown_days", "last_completed_at" FROM "quests";

-- Drop old table
DROP TABLE "quests";

-- Rename new table
ALTER TABLE "new_quests" RENAME TO "quests";

-- Recreate indexes
CREATE INDEX "quests_user_id_idx" ON "quests"("user_id");
