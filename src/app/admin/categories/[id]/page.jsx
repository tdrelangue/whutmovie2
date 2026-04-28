import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SaveBanner } from "@/components/admin/save-banner";

export const metadata = { title: "Edit Category - WhutMovie Admin" };

async function getCategory(id) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      assignments: {
        orderBy: [{ isHonorableMention: "asc" }, { rank: "asc" }],
        include: { movie: { select: { id: true, title: true, year: true } } },
      },
      groupAssignments: {
        orderBy: [{ isHonorableMention: "asc" }, { rank: "asc" }],
        include: {
          group: {
            select: {
              id: true,
              title: true,
              members: { select: { id: true }, orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });
}

async function getMovies() {
  return prisma.movie.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, year: true },
  });
}

async function getGroups() {
  return prisma.movieGroup.findMany({
    orderBy: { title: "asc" },
    select: {
      id: true,
      title: true,
      members: { select: { id: true }, orderBy: { order: "asc" } },
    },
  });
}

async function saveCategory(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const categoryType = formData.get("categoryType")?.toString() || "MOVIES";
  if (!id || !title || !description) return;
  const slug = slugify(title);
  try {
    await prisma.category.update({ where: { id }, data: { title, slug, description, categoryType } });
  } catch (e) {
    if (e.code !== "P2002") throw e;
    return;
  }
  for (const [key, val] of formData.entries()) {
    if (!key.startsWith("angleLabel-")) continue;
    const movieId = key.slice("angleLabel-".length);
    await prisma.categoryAssignment.update({
      where: { movieId_categoryId: { movieId, categoryId: id } },
      data: { angleLabel: val?.toString().trim() || null },
    });
  }
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/categories");
  revalidatePath("/");
  redirect(`/admin/categories/${id}?saved=1`);
}

async function assignPick(formData) {
  "use server";
  const categoryId = formData.get("categoryId")?.toString();
  const movieId = formData.get("movieId")?.toString();
  const isHonorable = formData.get("isHonorable") === "true";
  const rank = isHonorable ? null : parseInt(formData.get("rank")?.toString() || "0");
  if (!categoryId || !movieId) return;
  if (!isHonorable && (!rank || rank < 1 || rank > 3)) return;
  try {
    if (!isHonorable) await prisma.categoryAssignment.deleteMany({ where: { categoryId, rank } });
    await prisma.categoryAssignment.deleteMany({ where: { categoryId, movieId } });
    await prisma.categoryAssignment.create({ data: { categoryId, movieId, rank, isHonorableMention: isHonorable } });
  } catch (e) {
    console.error("assignPick error:", e);
    return;
  }
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

async function removePick(formData) {
  "use server";
  const categoryId = formData.get("categoryId")?.toString();
  const movieId = formData.get("movieId")?.toString();
  if (!categoryId || !movieId) return;
  await prisma.categoryAssignment.delete({ where: { movieId_categoryId: { movieId, categoryId } } });
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

async function assignGroup(formData) {
  "use server";
  const categoryId = formData.get("categoryId")?.toString();
  const groupId = formData.get("groupId")?.toString();
  const isHonorable = formData.get("isHonorable") === "true";
  const rank = isHonorable ? null : parseInt(formData.get("rank")?.toString() || "0");
  if (!categoryId || !groupId) return;
  if (!isHonorable && (!rank || rank < 1 || rank > 3)) return;
  try {
    if (!isHonorable) await prisma.categoryGroupAssignment.deleteMany({ where: { categoryId, rank } });
    await prisma.categoryGroupAssignment.deleteMany({ where: { categoryId, groupId } });
    await prisma.categoryGroupAssignment.create({ data: { categoryId, groupId, rank, isHonorableMention: isHonorable } });
  } catch (e) {
    console.error("assignGroup error:", e);
    return;
  }
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

async function removeGroup(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  const categoryId = formData.get("categoryId")?.toString();
  if (!id) return;
  await prisma.categoryGroupAssignment.delete({ where: { id } });
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

async function deleteCategory(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}

export default async function EditCategoryPage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const resolvedSearch = await searchParams;
  const saved = resolvedSearch?.saved === "1";

  const [category, movies, groups] = await Promise.all([getCategory(id), getMovies(), getGroups()]);
  if (!category) notFound();

  const isGroupCategory = category.categoryType === "GROUPS";

  // Movie picks
  const rankedPicks = category.assignments.filter((a) => !a.isHonorableMention);
  const honorableMentions = category.assignments.filter((a) => a.isHonorableMention);
  const assignedMovieIds = category.assignments.map((a) => a.movieId);
  const availableMovies = movies.filter((m) => !assignedMovieIds.includes(m.id));
  const usedMovieRanks = rankedPicks.map((a) => a.rank);
  const availableMovieRanks = [1, 2, 3].filter((r) => !usedMovieRanks.includes(r));

  // Group picks
  const rankedGroupPicks = category.groupAssignments.filter((ga) => !ga.isHonorableMention);
  const honorableGroupMentions = category.groupAssignments.filter((ga) => ga.isHonorableMention);
  const assignedGroupIds = category.groupAssignments.map((ga) => ga.groupId);
  const availableGroups = groups.filter((g) => !assignedGroupIds.includes(g.id));
  const usedGroupRanks = rankedGroupPicks.map((ga) => ga.rank);
  const availableGroupRanks = [1, 2, 3].filter((r) => !usedGroupRanks.includes(r));

  return (
    <>
      <SaveBanner show={saved} />

      <div className="space-y-8">
        <header>
          <div className="mb-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/categories">&larr; Back to Categories</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
          <p className="text-muted-foreground">Editing: {category.title}</p>
        </header>

        <form id="category-form" action={saveCategory}>
          <input type="hidden" name="id" value={category.id} />
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>Title, description, and category type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">Title *</label>
                <Input id="title" name="title" required defaultValue={category.title} placeholder="Category title" />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description * (the over-explained part)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  rows={6}
                  defaultValue={category.description}
                  placeholder="Write your humorous, thorough explanation of this category..."
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Category type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="categoryType"
                      value="MOVIES"
                      defaultChecked={!isGroupCategory}
                    />
                    <span className="text-sm">Movies — pick individual films (#1, #2, #3)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="categoryType"
                      value="GROUPS"
                      defaultChecked={isGroupCategory}
                    />
                    <span className="text-sm">Movie Groups — pick trilogies/sagas (#1, #2, #3)</span>
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Changing type doesn't remove existing assignments — save first, then manage picks below.
                </p>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* ── MOVIE PICKS (shown when type = MOVIES) ── */}
        {!isGroupCategory && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Top 3 Picks</CardTitle>
                <CardDescription>Manage ranked picks and their angle labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rankedPicks.length > 0 ? (
                  <div className="space-y-3">
                    {rankedPicks.map((a) => (
                      <div key={a.movieId} className="p-3 bg-muted rounded space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className="w-8 justify-center shrink-0">#{a.rank}</Badge>
                          <span className="flex-1 font-medium min-w-0">
                            {a.movie.title}
                            {a.movie.year && <span className="text-muted-foreground ml-1">({a.movie.year})</span>}
                          </span>
                          <form action={removePick} className="shrink-0">
                            <input type="hidden" name="categoryId" value={category.id} />
                            <input type="hidden" name="movieId" value={a.movieId} />
                            <Button type="submit" variant="ghost" size="sm">Remove</Button>
                          </form>
                        </div>
                        <div className="flex items-center gap-2">
                          <label htmlFor={`angle-${a.movieId}`} className="text-xs text-muted-foreground whitespace-nowrap">
                            Angle label:
                          </label>
                          <Input
                            id={`angle-${a.movieId}`}
                            form="category-form"
                            name={`angleLabel-${a.movieId}`}
                            defaultValue={a.angleLabel || ""}
                            placeholder="e.g., Action, Rom-com twist"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No ranked picks yet</p>
                )}
                {availableMovieRanks.length > 0 && availableMovies.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Add a ranked pick:</p>
                    <form action={assignPick} className="flex gap-2 items-end flex-wrap">
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="isHonorable" value="false" />
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-muted-foreground mb-1">Movie</label>
                        <select name="movieId" required className="w-full h-9 rounded-md border border-input select-dark px-3 text-sm">
                          <option value="">Select a movie…</option>
                          {availableMovies.map((m) => (
                            <option key={m.id} value={m.id}>{m.title}{m.year ? ` (${m.year})` : ""}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-muted-foreground mb-1">Rank</label>
                        <select name="rank" required className="w-full h-9 rounded-md border border-input select-dark px-3 text-sm">
                          {availableMovieRanks.map((r) => <option key={r} value={r}>#{r}</option>)}
                        </select>
                      </div>
                      <Button type="submit" size="sm">Add Pick</Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Honorable Mentions</CardTitle>
                <CardDescription>Additional movies worth mentioning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {honorableMentions.length > 0 ? (
                  <div className="space-y-3">
                    {honorableMentions.map((a) => (
                      <div key={a.movieId} className="p-3 bg-muted rounded space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium flex-1 min-w-0">
                            {a.movie.title}
                            {a.movie.year && <span className="text-muted-foreground ml-1">({a.movie.year})</span>}
                          </span>
                          <form action={removePick} className="shrink-0">
                            <input type="hidden" name="categoryId" value={category.id} />
                            <input type="hidden" name="movieId" value={a.movieId} />
                            <Button type="submit" variant="ghost" size="sm" className="h-7 px-2">Remove</Button>
                          </form>
                        </div>
                        <div className="flex items-center gap-2">
                          <label htmlFor={`angle-hm-${a.movieId}`} className="text-xs text-muted-foreground whitespace-nowrap">
                            Angle label:
                          </label>
                          <Input
                            id={`angle-hm-${a.movieId}`}
                            form="category-form"
                            name={`angleLabel-${a.movieId}`}
                            defaultValue={a.angleLabel || ""}
                            placeholder="e.g., Wildcard, Deep cut"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No honorable mentions yet</p>
                )}
                {availableMovies.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Add an honorable mention:</p>
                    <form action={assignPick} className="flex gap-2 items-end flex-wrap">
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="isHonorable" value="true" />
                      <input type="hidden" name="rank" value="0" />
                      <div className="flex-1 min-w-[200px]">
                        <select name="movieId" required className="w-full h-9 rounded-md border border-input select-dark px-3 text-sm">
                          <option value="">Select a movie…</option>
                          {availableMovies.map((m) => (
                            <option key={m.id} value={m.id}>{m.title}{m.year ? ` (${m.year})` : ""}</option>
                          ))}
                        </select>
                      </div>
                      <Button type="submit" size="sm">Add Mention</Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── GROUP PICKS (shown when type = GROUPS) ── */}
        {isGroupCategory && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Top 3 Group Picks</CardTitle>
                <CardDescription>Rank movie groups exactly like you would individual films</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rankedGroupPicks.length > 0 ? (
                  <div className="space-y-3">
                    {rankedGroupPicks.map((ga) => (
                      <div key={ga.id} className="p-3 bg-muted rounded flex items-center gap-3 flex-wrap">
                        <Badge className="w-8 justify-center shrink-0">#{ga.rank}</Badge>
                        <span className="flex-1 font-medium min-w-0">
                          {ga.group.title}
                          <span className="text-muted-foreground ml-1 text-sm font-normal">
                            ({ga.group.members.length} film{ga.group.members.length !== 1 ? "s" : ""})
                          </span>
                        </span>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/groups/${ga.groupId}`}>Edit group</Link>
                          </Button>
                          <form action={removeGroup}>
                            <input type="hidden" name="id" value={ga.id} />
                            <input type="hidden" name="categoryId" value={category.id} />
                            <Button type="submit" variant="ghost" size="sm">Remove</Button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No group picks yet</p>
                )}
                {availableGroupRanks.length > 0 && availableGroups.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Add a group pick:</p>
                    <form action={assignGroup} className="flex gap-2 items-end flex-wrap">
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="isHonorable" value="false" />
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-muted-foreground mb-1">Group</label>
                        <select name="groupId" required className="w-full h-9 rounded-md border border-input px-3 text-sm bg-background">
                          <option value="">Select a group…</option>
                          {availableGroups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title} ({g.members.length} film{g.members.length !== 1 ? "s" : ""})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <label className="block text-xs text-muted-foreground mb-1">Rank</label>
                        <select name="rank" required className="w-full h-9 rounded-md border border-input px-3 text-sm bg-background">
                          {availableGroupRanks.map((r) => <option key={r} value={r}>#{r}</option>)}
                        </select>
                      </div>
                      <Button type="submit" size="sm">Add Pick</Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Honorable Mentions</CardTitle>
                <CardDescription>Additional groups worth mentioning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {honorableGroupMentions.length > 0 ? (
                  <div className="space-y-2">
                    {honorableGroupMentions.map((ga) => (
                      <div key={ga.id} className="p-3 bg-muted rounded flex items-center gap-3 flex-wrap">
                        <span className="flex-1 font-medium min-w-0">
                          {ga.group.title}
                          <span className="text-muted-foreground ml-1 text-sm font-normal">
                            ({ga.group.members.length} film{ga.group.members.length !== 1 ? "s" : ""})
                          </span>
                        </span>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/groups/${ga.groupId}`}>Edit group</Link>
                          </Button>
                          <form action={removeGroup}>
                            <input type="hidden" name="id" value={ga.id} />
                            <input type="hidden" name="categoryId" value={category.id} />
                            <Button type="submit" variant="ghost" size="sm">Remove</Button>
                          </form>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No honorable mentions yet</p>
                )}
                {availableGroups.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Add an honorable mention:</p>
                    <form action={assignGroup} className="flex gap-2 items-end flex-wrap">
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="isHonorable" value="true" />
                      <input type="hidden" name="rank" value="0" />
                      <div className="flex-1 min-w-[200px]">
                        <select name="groupId" required className="w-full h-9 rounded-md border border-input px-3 text-sm bg-background">
                          <option value="">Select a group…</option>
                          {availableGroups.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title} ({g.members.length} film{g.members.length !== 1 ? "s" : ""})
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button type="submit" size="sm">Add Mention</Button>
                    </form>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="flex gap-2">
          <Button form="category-form" type="submit" size="lg">Save All Changes</Button>
          <Button asChild variant="outline">
            <Link href="/admin/categories">Cancel</Link>
          </Button>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete this category</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <Button type="submit" variant="destructive">Delete Category</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
