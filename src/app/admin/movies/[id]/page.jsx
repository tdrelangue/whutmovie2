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
  title: "Edit Movie - WhutMovie Admin",
};

async function getMovie(id) {
  return prisma.movie.findUnique({
    where: { id },
    include: {
      genres: true,
      categories: {
        include: {
          category: { select: { id: true, title: true, slug: true } },
        },
      },
    },
  });
}

async function getGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" } });
}

async function updateMovie(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const whutSummary = formData.get("whutSummary")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const yearStr = formData.get("year")?.toString().trim();
  const year = yearStr ? parseInt(yearStr) : null;
  const genreIds = formData.getAll("genres").map((g) => g.toString());

  if (!id || !title || !whutSummary) {
    return { error: "ID, Title and WhutSummary are required" };
  }

  const slug = slugify(title);

  try {
    await prisma.movie.update({
      where: { id },
      data: {
        title,
        slug,
        whutSummary,
        description,
        year,
        genres: {
          set: genreIds.map((gid) => ({ id: gid })),
        },
      },
    });
    revalidatePath("/admin/movies");
    revalidatePath(`/admin/movies/${id}`);
    revalidatePath("/movies");
    revalidatePath("/");
  } catch (e) {
    if (e.code === "P2002") {
      return { error: "A movie with this title already exists" };
    }
    throw e;
  }

  redirect("/admin/movies");
}

async function deleteMovie(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.movie.delete({ where: { id } });
  revalidatePath("/admin/movies");
  revalidatePath("/movies");
  revalidatePath("/");

  redirect("/admin/movies");
}

export default async function EditMoviePage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const [movie, genres] = await Promise.all([getMovie(id), getGenres()]);

  if (!movie) {
    notFound();
  }

  const movieGenreIds = movie.genres.map((g) => g.id);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/movies">&larr; Back to Movies</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Movie</h1>
        <p className="text-muted-foreground">Editing: {movie.title}</p>
      </header>

      {/* Edit Movie Form */}
      <Card>
        <CardHeader>
          <CardTitle>Movie Details</CardTitle>
          <CardDescription>Update the movie information</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateMovie} className="space-y-4">
            <input type="hidden" name="id" value={movie.id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  Title *
                </label>
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={movie.title}
                  placeholder="Movie title"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="year" className="block text-sm font-medium">
                  Year
                </label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="1900"
                  max="2100"
                  defaultValue={movie.year || ""}
                  placeholder="2024"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="whutSummary" className="block text-sm font-medium">
                WhutSummary * (your funny take)
              </label>
              <Textarea
                id="whutSummary"
                name="whutSummary"
                required
                rows={4}
                defaultValue={movie.whutSummary}
                placeholder="Your blunt, funny summary of what this movie is actually about..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium">
                Official Synopsis (optional)
              </label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={movie.description || ""}
                placeholder="The boring IMDb-style description (optional)"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Genres</label>
              <div className="flex flex-wrap gap-3">
                {genres.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="genres"
                      value={g.id}
                      defaultChecked={movieGenreIds.includes(g.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{g.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button asChild variant="outline">
                <Link href="/admin/movies">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Category Assignments */}
      {movie.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Assignments</CardTitle>
            <CardDescription>This movie appears in the following categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {movie.categories.map((ca) => (
                <Badge key={ca.categoryId} variant="secondary">
                  {ca.category.title} {ca.rank && `#${ca.rank}`}
                  {ca.isHonorableMention && "(Honorable Mention)"}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              To change category assignments, go to{" "}
              <Link href="/admin/categories" className="underline">
                Manage Categories
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Permanently delete this movie</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={deleteMovie}>
            <input type="hidden" name="id" value={movie.id} />
            <Button type="submit" variant="destructive">
              Delete Movie
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
