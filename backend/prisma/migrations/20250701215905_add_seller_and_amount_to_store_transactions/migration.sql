/*
  Warnings:

  - Added the required column `amount` to the `store_transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `store_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_store_transactions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "item_id" INTEGER NOT NULL,
    "buyer_id" INTEGER NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "processed_by" INTEGER,
    "processed_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "store_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "store_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "store_transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "store_transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "store_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_store_transactions" ("buyer_id", "created_at", "id", "item_id", "notes", "status", "updated_at") SELECT "buyer_id", "created_at", "id", "item_id", "notes", "status", "updated_at" FROM "store_transactions";
DROP TABLE "store_transactions";
ALTER TABLE "new_store_transactions" RENAME TO "store_transactions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
