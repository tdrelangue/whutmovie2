-- AlterTable
ALTER TABLE "public"."Movie" ADD COLUMN     "tmdbId" INTEGER;

-- AlterTable
ALTER TABLE "public"."StreamingLink" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'MANUAL';
