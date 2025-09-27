-- CreateTable
CREATE TABLE "CustomTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateName" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "CustomTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InvoiceSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "defaultDueDays" INTEGER NOT NULL DEFAULT 30,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
    "templateName" TEXT NOT NULL DEFAULT 'modern-blue',
    "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
    "defaultNotes" TEXT,
    "defaultTerms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "businessId" TEXT NOT NULL,
    CONSTRAINT "InvoiceSetting_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InvoiceSetting" ("businessId", "createdAt", "currency", "defaultDueDays", "defaultNotes", "defaultTerms", "id", "invoicePrefix", "nextInvoiceNumber", "taxRate", "updatedAt") SELECT "businessId", "createdAt", "currency", "defaultDueDays", "defaultNotes", "defaultTerms", "id", "invoicePrefix", "nextInvoiceNumber", "taxRate", "updatedAt" FROM "InvoiceSetting";
DROP TABLE "InvoiceSetting";
ALTER TABLE "new_InvoiceSetting" RENAME TO "InvoiceSetting";
CREATE UNIQUE INDEX "InvoiceSetting_businessId_key" ON "InvoiceSetting"("businessId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CustomTemplate_userId_templateName_key" ON "CustomTemplate"("userId", "templateName");
