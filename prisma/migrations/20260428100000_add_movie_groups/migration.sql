-- CreateTable
CREATE TABLE "public"."MovieGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MovieGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MovieGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "spoilerHidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MovieGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CategoryGroupAssignment" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "CategoryGroupAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MovieGroup_slug_key" ON "public"."MovieGroup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MovieGroupMember_groupId_movieId_key" ON "public"."MovieGroupMember"("groupId", "movieId");

-- CreateIndex
CREATE INDEX "MovieGroupMember_groupId_idx" ON "public"."MovieGroupMember"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryGroupAssignment_categoryId_groupId_key" ON "public"."CategoryGroupAssignment"("categoryId", "groupId");

-- CreateIndex
CREATE INDEX "CategoryGroupAssignment_categoryId_idx" ON "public"."CategoryGroupAssignment"("categoryId");

-- AddForeignKey
ALTER TABLE "public"."MovieGroupMember" ADD CONSTRAINT "MovieGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."MovieGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MovieGroupMember" ADD CONSTRAINT "MovieGroupMember_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoryGroupAssignment" ADD CONSTRAINT "CategoryGroupAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CategoryGroupAssignment" ADD CONSTRAINT "CategoryGroupAssignment_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."MovieGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
