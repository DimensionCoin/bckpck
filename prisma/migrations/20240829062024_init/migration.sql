/*
  Warnings:

  - You are about to drop the column `documentExpiryDate` on the `KYCVerification` table. All the data in the column will be lost.
  - You are about to drop the column `documentImageURL` on the `KYCVerification` table. All the data in the column will be lost.
  - You are about to drop the column `documentNumber` on the `KYCVerification` table. All the data in the column will be lost.
  - You are about to drop the column `documentType` on the `KYCVerification` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `KYCVerification` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `KYCVerification` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KYCVerification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "phoneNumber" TEXT,
    "address" TEXT,
    "city" TEXT,
    "stateOrProvince" TEXT,
    "postalOrZipCode" TEXT,
    "country" TEXT,
    "ssnOrSin" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KYCVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_KYCVerification" ("address", "city", "country", "createdAt", "dateOfBirth", "firstName", "id", "lastName", "phoneNumber", "ssnOrSin", "stateOrProvince", "updatedAt", "userId") SELECT "address", "city", "country", "createdAt", "dateOfBirth", "firstName", "id", "lastName", "phoneNumber", "ssnOrSin", "stateOrProvince", "updatedAt", "userId" FROM "KYCVerification";
DROP TABLE "KYCVerification";
ALTER TABLE "new_KYCVerification" RENAME TO "KYCVerification";
CREATE UNIQUE INDEX "KYCVerification_userId_key" ON "KYCVerification"("userId");
CREATE UNIQUE INDEX "KYCVerification_phoneNumber_key" ON "KYCVerification"("phoneNumber");
CREATE UNIQUE INDEX "KYCVerification_ssnOrSin_key" ON "KYCVerification"("ssnOrSin");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
