/*
  Warnings:

  - You are about to drop the column `description` on the `LabCase` table. All the data in the column will be lost.
  - You are about to drop the column `vendor` on the `LabCase` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `LabCase` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LabCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "caseType" TEXT NOT NULL DEFAULT 'Other',
    "toothNumbers" TEXT,
    "material" TEXT,
    "shade" TEXT,
    "labName" TEXT,
    "dentistNotes" TEXT,
    "labAssistantNotes" TEXT,
    "cost" REAL,
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "sentAt" DATETIME,
    "expectedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LabCase_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LabCase_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LabCase" ("deliveredAt", "expectedAt", "id", "patientId", "sentAt", "status") SELECT "deliveredAt", "expectedAt", "id", "patientId", "sentAt", "status" FROM "LabCase";
DROP TABLE "LabCase";
ALTER TABLE "new_LabCase" RENAME TO "LabCase";
CREATE INDEX "LabCase_patientId_idx" ON "LabCase"("patientId");
CREATE INDEX "LabCase_status_idx" ON "LabCase"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
