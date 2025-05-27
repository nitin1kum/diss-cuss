/*
  Warnings:

  - You are about to drop the column `content_id` on the `Discussion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[imdb_id]` on the table `Discussion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imdb_id` to the `Discussion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Discussion" DROP COLUMN "content_id",
ADD COLUMN     "imdb_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Discussion_imdb_id_key" ON "Discussion"("imdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
