-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "google_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "bounty_balance" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "character_name" TEXT,
    "avatar_url" TEXT,
    "character_class" TEXT,
    "character_bio" TEXT,
    "preferred_pronouns" TEXT,
    "favorite_color" TEXT,
    "character_level" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_users" ("bounty_balance", "created_at", "email", "google_id", "id", "name", "role", "updated_at") SELECT "bounty_balance", "created_at", "email", "google_id", "id", "name", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
