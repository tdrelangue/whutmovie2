-- Add categoryType to Category (default MOVIES for all existing rows)
ALTER TABLE "public"."Category" ADD COLUMN "categoryType" TEXT NOT NULL DEFAULT 'MOVIES';

-- Add rank and isHonorableMention to CategoryGroupAssignment
ALTER TABLE "public"."CategoryGroupAssignment" ADD COLUMN "rank" INTEGER;
ALTER TABLE "public"."CategoryGroupAssignment" ADD COLUMN "isHonorableMention" BOOLEAN NOT NULL DEFAULT false;

-- Unique: one group per rank per category (NULLs are treated as distinct in PG)
CREATE UNIQUE INDEX "CategoryGroupAssignment_categoryId_rank_key" ON "public"."CategoryGroupAssignment"("categoryId", "rank");
