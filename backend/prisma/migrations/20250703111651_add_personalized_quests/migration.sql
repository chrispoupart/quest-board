-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quests" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "bounty" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_by" INTEGER NOT NULL,
    "claimed_by" INTEGER,
    "claimed_at" DATETIME,
    "completed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" INTEGER,
    "is_repeatable" BOOLEAN NOT NULL DEFAULT false,
    "cooldown_days" INTEGER,
    "last_completed_at" DATETIME,
    CONSTRAINT "quests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quests_claimed_by_fkey" FOREIGN KEY ("claimed_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "quests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_quests" ("bounty", "claimed_at", "claimed_by", "completed_at", "cooldown_days", "created_at", "created_by", "description", "id", "is_repeatable", "last_completed_at", "status", "title", "updated_at") SELECT "bounty", "claimed_at", "claimed_by", "completed_at", "cooldown_days", "created_at", "created_by", "description", "id", "is_repeatable", "last_completed_at", "status", "title", "updated_at" FROM "quests";
DROP TABLE "quests";
ALTER TABLE "new_quests" RENAME TO "quests";
CREATE INDEX "quests_user_id_idx" ON "quests"("user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
