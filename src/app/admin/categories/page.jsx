import Link from "next/link";
import { redirect } from "next/navigation";
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
  title: "Manage Categories - WhutMovie Admin",
};

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assignments: {
        orderBy: { rank: "asc" },
        include: {
          movie: {
            select: { id: true, title: true, slug: true },
          },
        },
      },
    },
  });
}

async function getMovies() {
  return prisma.movie.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, slug: true },
  });
}

async function createCategory(formData) {
  "use server";

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!title || !description) {
    return { error: "Title and description are required" };
  }

  const slug = slugify(title);

  try {
    await prisma.category.create({
      data: { title, slug, description },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    revalidatePath("/");
  } catch (e) {
    if (e.code === "P2002") {
      return { error: "A category with this title already exists" };
    }
    throw e;
  }
}

async function deleteCategory(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
}

async function assignPick(formData) {
  "use server";

  const categoryId = formData.get("categoryId")?.toString();
  const movieId = formData.get("movieId")?.toString();
  const rank = parseInt(formData.get("rank")?.toString() || "0");

  if (!categoryId || !movieId || !rank || rank < 1 || rank > 3) {
    return { error: "Invalid assignment data" };
  }

  try {
    // Remove existing assignment at this rank if any
    await prisma.categoryAssignment.deleteMany({
      where: { categoryId, rank },
    });

    // Remove existing assignment for this movie in this category if any
    await prisma.categoryAssignment.deleteMany({
      where: { categoryId, movieId },
    });

    // Create new assignment
    await prisma.categoryAssignment.create({
      data: { categoryId, movieId, rank },
    });

    revalidatePath("/admin/categories");
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
  revalidatePath("/categories");
  revalidatePath("/");
}

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const [categories, movies] = await Promise.all([
    getCategories(),
    getMovies(),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">&larr; Dashboard</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
        <p className="text-muted-foreground">Create categories and assign their 3 ranked picks</p>
      </header>

      {/* Create Category Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
          <CardDescription>Add a new curated category with an over-explained description</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <Input id="title" name="title" required placeholder="e.g., Rom-coms (but with problems)" />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium">
                Description (the over-explained part)
              </label>
              <Textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="Write your humorous, thorough explanation of this category..."
              />
            </div>
            <Button type="submit">Create Category</Button>
          </form>
        </CardContent>
      </Card>

      {/* Categories List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Existing Categories ({categories.length})</h2>
        {categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/categories/${category.id}`}>Edit</Link>
                      </Button>
                      <form action={deleteCategory}>
                        <input type="hidden" name="id" value={category.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Picks */}
                  <div>
                    <p className="text-sm font-medium mb-2">Current Picks:</p>
                    {category.assignments.length > 0 ? (
                      <div className="space-y-2">
                        {category.assignments.map((a) => (
                          <div key={a.movieId} className="flex items-center gap-2">
                            <Badge>#{a.rank}</Badge>
                            <span className="flex-1">{a.movie.title}</span>
                            <form action={removePick}>
                              <input type="hidden" name="categoryId" value={category.id} />
                              <input type="hidden" name="movieId" value={a.movieId} />
                              <Button type="submit" variant="ghost" size="sm">
                                Remove
                              </Button>
                            </form>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No picks assigned</p>
                    )}
                  </div>

                  {/* Assign Pick Form */}
                  {category.assignments.length < 3 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Assign a Pick:</p>
                      <form action={assignPick} className="flex gap-2 items-end flex-wrap">
                        <input type="hidden" name="categoryId" value={category.id} />
                        <div className="flex-1 min-w-[200px]">
                          <label htmlFor={`movie-${category.id}`} className="block text-xs text-muted-foreground mb-1">
                            Movie
                          </label>
                          <select
                            id={`movie-${category.id}`}
                            name="movieId"
                            required
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                          >
                            <option value="">Select a movie...</option>
                            {movies
                              .filter((m) => !category.assignments.some((a) => a.movieId === m.id))
                              .map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.title}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label htmlFor={`rank-${category.id}`} className="block text-xs text-muted-foreground mb-1">
                            Rank
                          </label>
                          <select
                            id={`rank-${category.id}`}
                            name="rank"
                            required
                            className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                          >
                            {[1, 2, 3]
                              .filter((r) => !category.assignments.some((a) => a.rank === r))
                              .map((r) => (
                                <option key={r} value={r}>
                                  #{r}
                                </option>
                              ))}
                          </select>
                        </div>
                        <Button type="submit" size="sm">
                          Assign
                        </Button>
                      </form>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No categories yet. Create one above.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
