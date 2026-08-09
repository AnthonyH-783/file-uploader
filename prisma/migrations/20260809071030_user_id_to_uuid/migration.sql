/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Upload` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[ownerId,folderId,name]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,parentId,name]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_folderId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Upload" DROP CONSTRAINT "Upload_userId_fkey";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "Upload";

-- CreateIndex
CREATE INDEX "File_ownerId_folderId_idx" ON "File"("ownerId", "folderId");

-- CreateIndex
CREATE UNIQUE INDEX "File_ownerId_folderId_name_key" ON "File"("ownerId", "folderId", "name");

-- CreateIndex
CREATE INDEX "Folder_ownerId_parentId_idx" ON "Folder"("ownerId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_ownerId_parentId_name_key" ON "Folder"("ownerId", "parentId", "name");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
