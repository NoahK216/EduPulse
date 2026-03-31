-- AlterTable
ALTER TABLE "attempt" ADD COLUMN     "current_node_id" VARCHAR(255),
ADD COLUMN     "last_activity_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
