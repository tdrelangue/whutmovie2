-- AlterTable
ALTER TABLE "public"."CategoryAssignment" ADD COLUMN     "angleLabel" TEXT;

-- RenameIndex
ALTER INDEX "public"."uniq_category_rank" RENAME TO "CategoryAssignment_categoryId_rank_key";
