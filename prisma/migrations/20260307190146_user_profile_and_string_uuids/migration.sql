/*
  Warnings:

  - You are about to drop the `assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classroom_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classrooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `responses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scenario_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scenarios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_assigned_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_classroom_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_scenario_version_id_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_student_user_id_fkey";

-- DropForeignKey
ALTER TABLE "classroom_members" DROP CONSTRAINT "classroom_members_classroom_id_fkey";

-- DropForeignKey
ALTER TABLE "classroom_members" DROP CONSTRAINT "classroom_members_user_id_fkey";

-- DropForeignKey
ALTER TABLE "classrooms" DROP CONSTRAINT "classrooms_created_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "responses" DROP CONSTRAINT "responses_attempt_id_fkey";

-- DropForeignKey
ALTER TABLE "scenario_versions" DROP CONSTRAINT "scenario_versions_published_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "scenario_versions" DROP CONSTRAINT "scenario_versions_scenario_id_fkey";

-- DropForeignKey
ALTER TABLE "scenarios" DROP CONSTRAINT "scenarios_owner_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_auth_user_id_fkey";

-- DropTable
DROP TABLE "assignments";

-- DropTable
DROP TABLE "attempts";

-- DropTable
DROP TABLE "classroom_members";

-- DropTable
DROP TABLE "classrooms";

-- DropTable
DROP TABLE "responses";

-- DropTable
DROP TABLE "scenario_versions";

-- DropTable
DROP TABLE "scenarios";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "user_profile" (
    "id" UUID NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_by_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classroom_member" (
    "classroom_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "classroom_role" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classroom_member_pkey" PRIMARY KEY ("classroom_id","user_id")
);

-- CreateTable
CREATE TABLE "scenario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "draft_content" JSONB,
    "latest_version_number" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "scenario_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" JSONB NOT NULL,
    "published_by_user_id" UUID NOT NULL,
    "published_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "classroom_id" UUID NOT NULL,
    "scenario_version_id" UUID NOT NULL,
    "assigned_by_user_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "instructions" TEXT,
    "open_at" TIMESTAMPTZ(6),
    "due_at" TIMESTAMPTZ(6),
    "close_at" TIMESTAMPTZ(6),
    "max_attempts" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assignment_id" UUID NOT NULL,
    "student_user_id" UUID NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "status" "attempt_status" NOT NULL DEFAULT 'in_progress',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ(6),

    CONSTRAINT "attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "attempt_id" UUID NOT NULL,
    "node_id" VARCHAR(255) NOT NULL,
    "response_payload" JSONB,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "classroom_created_by_id_idx" ON "classroom"("created_by_id");

-- CreateIndex
CREATE INDEX "classroom_member_user_id_idx" ON "classroom_member"("user_id");

-- CreateIndex
CREATE INDEX "classroom_member_classroom_id_role_idx" ON "classroom_member"("classroom_id", "role");

-- CreateIndex
CREATE INDEX "scenario_owner_user_id_idx" ON "scenario"("owner_user_id");

-- CreateIndex
CREATE INDEX "scenario_version_published_by_user_id_idx" ON "scenario_version"("published_by_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_version_scenario_id_version_number_key" ON "scenario_version"("scenario_id", "version_number");

-- CreateIndex
CREATE INDEX "assignment_classroom_id_idx" ON "assignment"("classroom_id");

-- CreateIndex
CREATE INDEX "assignment_assigned_by_user_id_idx" ON "assignment"("assigned_by_user_id");

-- CreateIndex
CREATE INDEX "assignment_due_at_idx" ON "assignment"("due_at");

-- CreateIndex
CREATE INDEX "attempt_student_user_id_idx" ON "attempt"("student_user_id");

-- CreateIndex
CREATE INDEX "attempt_assignment_id_status_idx" ON "attempt"("assignment_id", "status");

-- CreateIndex
CREATE INDEX "attempt_submitted_at_idx" ON "attempt"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "attempt_assignment_id_student_user_id_attempt_number_key" ON "attempt"("assignment_id", "student_user_id", "attempt_number");

-- CreateIndex
CREATE INDEX "response_created_at_idx" ON "response"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "response_attempt_id_node_id_key" ON "response"("attempt_id", "node_id");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_id_fkey" FOREIGN KEY ("id") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classroom" ADD CONSTRAINT "classroom_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "classroom_member" ADD CONSTRAINT "classroom_member_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "classroom_member" ADD CONSTRAINT "classroom_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scenario_version" ADD CONSTRAINT "scenario_version_published_by_user_id_fkey" FOREIGN KEY ("published_by_user_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "scenario_version" ADD CONSTRAINT "scenario_version_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenario"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_assigned_by_user_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classroom"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_scenario_version_id_fkey" FOREIGN KEY ("scenario_version_id") REFERENCES "scenario_version"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_student_user_id_fkey" FOREIGN KEY ("student_user_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "attempt"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
