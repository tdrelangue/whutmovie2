-- CreateTable
CREATE TABLE "public"."StreamingLink" (
    "id" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamingLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StreamingLink_movieId_idx" ON "public"."StreamingLink"("movieId");

-- AddForeignKey
ALTER TABLE "public"."StreamingLink" ADD CONSTRAINT "StreamingLink_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
