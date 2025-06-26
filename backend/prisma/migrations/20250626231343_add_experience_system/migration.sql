/*
  Warnings:

  - You are about to drop the column `character_level` on the `users` table. All the data in the column will be lost.

*/
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
    "experience" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_users" ("avatar_url", "bounty_balance", "character_bio", "character_class", "character_name", "created_at", "email", "favorite_color", "google_id", "id", "name", "preferred_pronouns", "role", "updated_at") SELECT "avatar_url", "bounty_balance", "character_bio", "character_class", "character_name", "created_at", "email", "favorite_color", "google_id", "id", "name", "preferred_pronouns", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
