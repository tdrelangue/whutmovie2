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

export const metadata = {
  title: "Edit Category - WhutMovie Admin",
};

async function getCategory(id) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      assignments: {
        orderBy: { rank: "asc" },
        include: {
          movie: {
            select: { id: true, title: true, slug: true, year: true },
          },
        },
      },
    },
  });
}

async function getMovies() {
  return prisma.movie.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true, year: true },
  });
}

async function updateCategory(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!id || !title || !description) {
    return { error: "ID, Title and Description are required" };
  }

  const slug = slugify(title);

  try {
    await prisma.category.update({
      where: { id },
      data: {
        title,
        slug,
        description,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    revalidatePath("/categories");
    revalidatePath("/");
  } catch (e) {
    if (e.code === "P2002") {
      return { error: "A category with this title already exists" };
    }
    throw e;
  }

  redirect("/admin/categories");
}

async function assignPick(formData) {
  "use server";

  const categoryId = formData.get("categoryId")?.toString();
  const movieId = formData.get("movieId")?.toString();
  const rank = parseInt(formData.get("rank")?.toString() || "0");
  const isHonorable = formData.get("isHonorable") === "true";

  if (!categoryId || !movieId) {
    return { error: "Invalid assignment data" };
  }

  if (!isHonorable && (!rank || rank < 1 || rank > 3)) {
    return { error: "Rank must be 1, 2, or 3 for ranked picks" };
  }

  try {
    // Remove existing assignment at this rank if any (only for ranked picks)
    if (!isHonorable) {
      await prisma.categoryAssignment.deleteMany({
        where: { categoryId, rank },
      });
    }

    // Remove existing assignment for this movie in this category if any
    await prisma.categoryAssignment.deleteMany({
      where: { categoryId, movieId },
    });

    // Create new assignment
    await prisma.categoryAssignment.create({
      data: {
        categoryId,
        movieId,
        rank: isHonorable ? null : rank,
        isHonorableMention: isHonorable,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${categoryId}`);
    revalidatePath("/categories");
    revalidatePath("/");
  } catch (e) {
    console.error("Assignment error:", e);
    return { error: "Failed to assign pick" };
  }
}

async function removePick(formData) {
  "use server";

  const categoryId = formData.get("categoryId")?.toString();
  const movieId = formData.get("movieId")?.toString();

  if (!categoryId || !movieId) return;

  await prisma.categoryAssignment.delete({
    where: {
      movieId_categoryId: { movieId, categoryId },
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath("/");
}

async function updateAngleLabel(formData) {
  "use server";

  const categoryId = formData.get("categoryId")?.toString();
  const movieId = formData.get("movieId")?.toString();
  const angleLabel = formData.get("angleLabel")?.toString().trim() || null;

  if (!categoryId || !movieId) return;

  await prisma.categoryAssignment.update({
    where: {
      movieId_categoryId: { movieId, categoryId },
    },
    data: {
      angleLabel,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");
  revalidatePath(`/categories`);
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

export default async function EditCategoryPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const [category, movies] = await Promise.all([getCategory(id), getMovies()]);

  if (!category) {
    notFound();
  }

  const rankedPicks = category.assignments.filter((a) => !a.isHonorableMention);
  const honorableMentions = category.assignments.filter((a) => a.isHonorableMention);
  const assignedMovieIds = category.assignments.map((a) => a.movieId);
  const availableMovies = movies.filter((m) => !assignedMovieIds.includes(m.id));
  const usedRanks = rankedPicks.map((a) => a.rank);
  const availableRanks = [1, 2, 3].filter((r) => !usedRanks.includes(r));

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/categories">&larr; Back to Categories</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
        <p className="text-muted-foreground">Editing: {category.title}</p>
      </header>

      {/* Edit Category Form */}
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Update the category information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateCategory} className="space-y-4">
            <input type="hidden" name="id" value={category.id} />

            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={category.title}
                placeholder="Category title"
              />
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

            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button asChild variant="outline">
                <Link href="/admin/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ranked Picks */}
      <Card>
        <CardHeader>
          <CardTitle>Top 3 Picks</CardTitle>
          <CardDescription>The ranked movie picks for this category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rankedPicks.length > 0 ? (
            <div className="space-y-4">
              {rankedPicks.map((a) => (
                <div key={a.movieId} className="p-3 bg-muted rounded space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className="w-8 justify-center">#{a.rank}</Badge>
                    <span className="flex-1 font-medium">
                      {a.movie.title}
                      {a.movie.year && <span className="text-muted-foreground ml-1">({a.movie.year})</span>}
                    </span>
                    <form action={removePick}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="movieId" value={a.movieId} />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                  <form action={updateAngleLabel} className="flex items-center gap-2">
                    <input type="hidden" name="categoryId" value={category.id} />
                    <input type="hidden" name="movieId" value={a.movieId} />
                    <label htmlFor={`angleLabel-${a.movieId}`} className="text-xs text-muted-foreground whitespace-nowrap">
                      Angle label for Rank {a.rank}:
                    </label>
                    <Input
                      id={`angleLabel-${a.movieId}`}
                      name="angleLabel"
                      defaultValue={a.angleLabel || ""}
                      placeholder="e.g., Action, Rom-com twist, Philosophical"
                      className="h-8 text-sm flex-1"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No ranked picks yet</p>
          )}

          {/* Add Ranked Pick */}
          {availableRanks.length > 0 && availableMovies.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Add a ranked pick:</p>
              <form action={assignPick} className="flex gap-2 items-end flex-wrap">
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="hidden" name="isHonorable" value="false" />
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs text-muted-foreground mb-1">Movie</label>
                  <select
                    name="movieId"
                    required
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select a movie...</option>
                    {availableMovies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} {m.year && `(${m.year})`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs text-muted-foreground mb-1">Rank</label>
                  <select
                    name="rank"
                    required
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {availableRanks.map((r) => (
                      <option key={r} value={r}>
                        #{r}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" size="sm">
                  Add Pick
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Honorable Mentions */}
      <Card>
        <CardHeader>
          <CardTitle>Honorable Mentions</CardTitle>
          <CardDescription>Additional movies worth mentioning in this category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {honorableMentions.length > 0 ? (
            <div className="space-y-3">
              {honorableMentions.map((a) => (
                <div key={a.movieId} className="p-3 bg-muted rounded space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium flex-1">
                      {a.movie.title}
                      {a.movie.year && <span className="text-muted-foreground ml-1">({a.movie.year})</span>}
                    </span>
                    <form action={removePick}>
                      <input type="hidden" name="categoryId" value={category.id} />
                      <input type="hidden" name="movieId" value={a.movieId} />
                      <Button type="submit" variant="ghost" size="sm" className="h-6 px-2">
                        Remove
                      </Button>
                    </form>
                  </div>
                  <form action={updateAngleLabel} className="flex items-center gap-2">
                    <input type="hidden" name="categoryId" value={category.id} />
                    <input type="hidden" name="movieId" value={a.movieId} />
                    <label htmlFor={`angleLabel-hm-${a.movieId}`} className="text-xs text-muted-foreground whitespace-nowrap">
                      Angle label:
                    </label>
                    <Input
                      id={`angleLabel-hm-${a.movieId}`}
                      name="angleLabel"
                      defaultValue={a.angleLabel || ""}
                      placeholder="e.g., Wildcard, Deep cut"
                      className="h-8 text-sm flex-1"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      Save
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">No honorable mentions yet</p>
          )}

          {/* Add Honorable Mention */}
          {availableMovies.length > 0 && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Add an honorable mention:</p>
              <form action={assignPick} className="flex gap-2 items-end flex-wrap">
                <input type="hidden" name="categoryId" value={category.id} />
                <input type="hidden" name="isHonorable" value="true" />
                <input type="hidden" name="rank" value="0" />
                <div className="flex-1 min-w-[200px]">
                  <select
                    name="movieId"
                    required
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="">Select a movie...</option>
                    {availableMovies.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} {m.year && `(${m.year})`}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" size="sm">
                  Add Mention
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete this category</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={deleteCategory}>
            <input type="hidden" name="id" value={category.id} />
            <Button type="submit" variant="destructive">
              Delete Category
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
