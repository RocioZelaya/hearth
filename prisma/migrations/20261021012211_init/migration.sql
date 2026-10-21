-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT,
    "paymentUrl" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "reports" INTEGER NOT NULL DEFAULT 0,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "noteId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RateLimitHit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ipHash" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Note_hidden_createdAt_idx" ON "Note"("hidden", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Report_noteId_ipHash_key" ON "Report"("noteId", "ipHash");

-- CreateIndex
CREATE INDEX "RateLimitHit_ipHash_action_createdAt_idx" ON "RateLimitHit"("ipHash", "action", "createdAt");
