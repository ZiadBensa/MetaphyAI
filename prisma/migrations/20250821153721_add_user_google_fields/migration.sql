/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ALTER COLUMN "id" SET DEFAULT concat('msg_', replace(cast(gen_random_uuid() as text), '-', '') );

-- AlterTable
ALTER TABLE "ChatSession" ALTER COLUMN "id" SET DEFAULT concat('chat_', replace(cast(gen_random_uuid() as text), '-', '') );

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "id" SET DEFAULT concat('doc_', replace(cast(gen_random_uuid() as text), '-', '') );

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "id" SET DEFAULT concat('usr_', replace(cast(gen_random_uuid() as text), '-', '') );

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
