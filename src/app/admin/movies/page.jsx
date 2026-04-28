import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoviesList } from "@/components/admin/movies-list";
import { NewMovieForm } from "@/components/admin/new-movie-form";

export const metadata = {
  title: "Manage Movies - WhutMovie Admin",
};

async function getMovies() {
  return prisma.movie.findMany({
    orderBy: { title: "asc" },
    include: {
      genres: true,
      categories: {
        include: {
          category: { select: { title: true, slug: true } },
        },
      },
    },
  });
}

async function getGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" } });
}

async function createMovie(formData) {
  "use server";

  const title = formData.get("title")?.toString().trim();
  const whutSummary = formData.get("whutSummary")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  const yearStr = formData.get("year")?.toString().trim();
  const year = yearStr ? parseInt(yearStr) : null;
  const tmdbIdStr = formData.get("tmdbId")?.toString().trim();
  const tmdbId = tmdbIdStr ? parseInt(tmdbIdStr) : null;
  const posterUrl = formData.get("posterUrl")?.toString().trim() || null;
  const genreIds = formData.getAll("genres").map((g) => g.toString());

  if (!title || !whutSummary) return;

  const slug = slugify(title);

  try {
    await prisma.movie.create({
      data: {
        title,
        slug,
        whutSummary,
        description,
        year,
        tmdbId,
        posterUrl,
        genres: { connect: genreIds.map((id) => ({ id })) },
      },
    });
    revalidatePath("/admin/movies");
    revalidatePath("/movies");
    revalidatePath("/");
  } catch (e) {
    if (e.code !== "P2002") throw e;
  }
}

async function deleteMovie(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.movie.delete({ where: { id } });
  revalidatePath("/admin/movies");
  revalidatePath("/movies");
  revalidatePath("/");
}

async function createGenre(formData) {
  "use server";

  const name = formData.get("name")?.toString().trim();
  if (!name) return;

  const slug = slugify(name);

  try {
    await prisma.genre.create({ data: { name, slug } });
    revalidatePath("/admin/movies");
  } catch (e) {
    if (e.code !== "P2002") throw e;
  }
}

export default async function AdminMoviesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const [movies, genres] = await Promise.all([getMovies(), getGenres()]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Manage Movies</h1>
        <p className="text-muted-foreground">
          Add movies with your unique WhutSummary descriptions
        </p>
      </header>

      {/* Quick: Add Genre */}
      <Card>
        <CardHeader>
          <CardTitle>Quick: Add Genre</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createGenre} className="flex gap-2">
            <Input
              name="name"
              placeholder="Genre name"
              required
              className="max-w-xs"
            />
            <Button type="submit" variant="outline">
              Add Genre
            </Button>
          </form>
          <div className="flex flex-wrap gap-1 mt-3">
            {genres.map((g) => (
              <Badge key={g.id} variant="outline">
                {g.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Movie */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Movie</CardTitle>
          <CardDescription>
            Include your funny WhutSummary (required) and optionally the
            official synopsis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewMovieForm createAction={createMovie} genres={genres} />
        </CardContent>
      </Card>

      {/* Movies list with search */}
      <MoviesList movies={movies} deleteAction={deleteMovie} />
    </div>
  );
}
