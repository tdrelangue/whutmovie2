ALTER TABLE "public"."Category" ADD COLUMN "categoryType" TEXT NOT NULL DEFAULT 'MOVIES';

ALTER TABLE "public"."CategoryGroupAssignment" ADD COLUMN "rank" INTEGER;
ALTER TABLE "public"."CategoryGroupAssignment" ADD COLUMN "isHonorableMention" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "CategoryGroupAssignment_categoryId_rank_key" ON "public"."CategoryGroupAssignment"("categoryId", "rank");
