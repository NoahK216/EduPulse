-- DropForeignKey
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_owner_user_id_fkey";

-- AddForeignKey
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
