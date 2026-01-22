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

export const metadata = {
  title: "Manage Genres - WhutMovie Admin",
};

async function getGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { movies: true },
      },
    },
  });
}

async function createGenre(formData) {
  "use server";

  const name = formData.get("name")?.toString().trim();

  if (!name) {
    return { error: "Genre name is required" };
  }

  const slug = slugify(name);

  try {
    await prisma.genre.create({
      data: { name, slug },
    });
    revalidatePath("/admin/genres");
    revalidatePath("/admin/movies");
    revalidatePath("/");
  } catch (e) {
    if (e.code === "P2002") {
      return { error: "A genre with this name already exists" };
    }
    throw e;
  }
}

async function deleteGenre(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  if (!id) return;

  // Check if genre has movies
  const genre = await prisma.genre.findUnique({
    where: { id },
    include: {
      _count: { select: { movies: true } },
    },
  });

  if (!genre) return;

  // Disconnect from movies first (many-to-many)
  await prisma.genre.update({
    where: { id },
    data: {
      movies: {
        set: [], // Disconnect all movies
      },
    },
  });

  // Now delete the genre
  await prisma.genre.delete({ where: { id } });

  revalidatePath("/admin/genres");
  revalidatePath("/admin/movies");
  revalidatePath("/");
}

async function updateGenre(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  const name = formData.get("name")?.toString().trim();

  if (!id || !name) return;

  const slug = slugify(name);

  try {
    await prisma.genre.update({
      where: { id },
      data: { name, slug },
    });
    revalidatePath("/admin/genres");
    revalidatePath("/admin/movies");
    revalidatePath("/");
  } catch (e) {
    if (e.code === "P2002") {
      return { error: "A genre with this name already exists" };
    }
    throw e;
  }
}

export default async function AdminGenresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const genres = await getGenres();

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">&larr; Dashboard</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Genres</h1>
        <p className="text-muted-foreground">Create and manage movie genres</p>
      </header>

      {/* Create Genre Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Genre</CardTitle>
          <CardDescription>Add a new genre for categorizing movies</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createGenre} className="flex gap-2">
            <Input
              name="name"
              placeholder="Genre name (e.g., Sci-Fi, Horror, Comedy)"
              required
              className="max-w-sm"
            />
            <Button type="submit">Create Genre</Button>
          </form>
        </CardContent>
      </Card>

      {/* Genres List */}
      <section>
        <h2 className="text-xl font-semibold mb-4">All Genres ({genres.length})</h2>
        {genres.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {genres.map((genre) => (
              <Card key={genre.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{genre.name}</CardTitle>
                      <CardDescription className="text-xs">
                        slug: {genre.slug}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {genre._count.movies} movie{genre._count.movies !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Edit Form */}
                  <form action={updateGenre} className="flex gap-2">
                    <input type="hidden" name="id" value={genre.id} />
                    <Input
                      name="name"
                      defaultValue={genre.name}
                      className="text-sm h-8"
                      required
                    />
                    <Button type="submit" variant="outline" size="sm">
                      Update
                    </Button>
                  </form>

                  {/* Delete Form */}
                  <form action={deleteGenre}>
                    <input type="hidden" name="id" value={genre.id} />
                    <Button
                      type="submit"
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      Delete{genre._count.movies > 0 && ` (will unlink ${genre._count.movies} movies)`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No genres yet. Create one above.
            </CardContent>
          </Card>
        )}
      </section>

      {/* Suggested Genres */}
      <Card>
        <CardHeader>
          <CardTitle>Common Genres</CardTitle>
          <CardDescription>Quick reference for common movie genres you might want to add</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Action", "Adventure", "Animation", "Biography", "Comedy", "Crime",
              "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
              "Music", "Musical", "Mystery", "Romance", "Sci-Fi", "Sport",
              "Thriller", "War", "Western"
            ].map((g) => {
              const exists = genres.some(
                (genre) => genre.name.toLowerCase() === g.toLowerCase()
              );
              return (
                <Badge
                  key={g}
                  variant={exists ? "default" : "outline"}
                  className={exists ? "opacity-50" : ""}
                >
                  {g} {exists && "✓"}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
