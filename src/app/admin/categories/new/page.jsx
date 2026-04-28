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

export const metadata = {
  title: "New Category - WhutMovie Admin",
};

async function getMovies() {
  return prisma.movie.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, year: true },
  });
}

async function createCategory(formData) {
  "use server";

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!title || !description) return;

  const slug = slugify(title);

  let category;
  try {
    category = await prisma.category.create({
      data: { title, slug, description },
    });
  } catch (e) {
    if (e.code !== "P2002") throw e;
    return;
  }

  // Ranked picks (optional)
  const pickIds = [
    formData.get("pick1")?.toString() || null,
    formData.get("pick2")?.toString() || null,
    formData.get("pick3")?.toString() || null,
  ];

  for (let i = 0; i < pickIds.length; i++) {
    const movieId = pickIds[i];
    if (!movieId) continue;
    await prisma.categoryAssignment.create({
      data: { categoryId: category.id, movieId, rank: i + 1 },
    });
  }

  // Honorable mentions (multiple checkboxes)
  const hmIds = formData.getAll("honorableMentions").map((v) => v.toString());
  const usedIds = pickIds.filter(Boolean);

  for (const movieId of hmIds) {
    if (usedIds.includes(movieId)) continue;
    await prisma.categoryAssignment.create({
      data: {
        categoryId: category.id,
        movieId,
        rank: null,
        isHonorableMention: true,
      },
    });
  }

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");

  redirect(`/admin/categories/${category.id}?saved=1`);
}

export default async function NewCategoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const movies = await getMovies();

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/categories">&larr; Back to Categories</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">New Category</h1>
        <p className="text-muted-foreground">
          Fill in everything now — no need to come back to edit
        </p>
      </header>

      <form action={createCategory} className="space-y-8">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., Rom-coms (but with problems)"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium"
              >
                Description * (the over-explained part)
              </label>
              <Textarea
                id="description"
                name="description"
                required
                rows={5}
                placeholder="Write your humorous, thorough explanation of this category..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Top 3 Picks */}
        <Card>
          <CardHeader>
            <CardTitle>Top 3 Picks</CardTitle>
            <CardDescription>
              All optional — you can leave slots empty and fill them later
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "pick1", label: "#1" },
              { name: "pick2", label: "#2" },
              { name: "pick3", label: "#3" },
            ].map(({ name, label }) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm font-medium w-6 shrink-0">
                  {label}
                </span>
                <select
                  name={name}
                  className="select-dark flex-1 h-9 rounded-md border border-input px-3 text-sm"
                >
                  <option value="">— None —</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                      {m.year ? ` (${m.year})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Honorable Mentions */}
        <Card>
          <CardHeader>
            <CardTitle>Honorable Mentions</CardTitle>
            <CardDescription>
              Check any movies to include as honorable mentions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto pr-1"
              role="group"
              aria-label="Honorable mentions"
            >
              {movies.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-2 cursor-pointer hover:text-foreground text-sm text-muted-foreground"
                >
                  <input
                    type="checkbox"
                    name="honorableMentions"
                    value={m.id}
                    className="rounded shrink-0"
                  />
                  <span className="truncate">
                    {m.title}
                    {m.year ? ` (${m.year})` : ""}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit">Create Category</Button>
          <Button asChild variant="outline">
            <Link href="/admin/categories">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
