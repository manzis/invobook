/*
  Warnings:

  - Added the required column `balanceDue` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceNumber" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL NOT NULL,
    "shippingCost" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "amountPaid" DECIMAL NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL NOT NULL,
    "notes" TEXT,
    "terms" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Invoice" ("clientId", "createdAt", "date", "dueDate", "id", "invoiceNumber", "notes", "shippingCost", "status", "subtotal", "taxAmount", "taxRate", "terms", "total", "updatedAt", "userId") SELECT "clientId", "createdAt", "date", "dueDate", "id", "invoiceNumber", "notes", "shippingCost", "status", "subtotal", "taxAmount", "taxRate", "terms", "total", "updatedAt", "userId" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
CREATE UNIQUE INDEX "Invoice_userId_invoiceNumber_key" ON "Invoice"("userId", "invoiceNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
