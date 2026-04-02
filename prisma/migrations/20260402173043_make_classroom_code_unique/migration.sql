/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `classroom` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "classroom_code_key" ON "classroom"("code");
