-- CreateTable
CREATE TABLE "InvoiceSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "defaultDueDays" INTEGER NOT NULL DEFAULT 30,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "invoicePrefix" TEXT NOT NULL DEFAULT 'INV-',
    "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
    "defaultNotes" TEXT,
    "defaultTerms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "businessId" TEXT NOT NULL,
    CONSTRAINT "InvoiceSetting_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceSetting_businessId_key" ON "InvoiceSetting"("businessId");
