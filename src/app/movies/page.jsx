import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MovieCard } from "@/components/movie-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

async function getMovies({ page = 1, genre, sort = "year" }) {
  const where = {};

  if (genre) {
    where.genres = {
      some: {
        slug: genre,
      },
    };
  }

  const orderBy = sort === "title"
    ? { title: "asc" }
    : { year: "desc" };

  const [movies, total] = await Promise.all([
    prisma.movie.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy,
      include: {
        genres: true,
      },
    }),
    prisma.movie.count({ where }),
  ]);

  return { movies, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

async function getGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" } });
}

export const metadata = {
  title: "Movies - WhutMovie",
  description: "Browse our collection of movies. Filter by genre to find what you're looking for.",
};

export default async function MoviesPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page) || 1;
  const genre = params.genre || null;
  const sort = params.sort || "year";

  const [{ movies, total, totalPages }, genres] = await Promise.all([
    getMovies({ page, genre, sort }),
    getGenres(),
  ]);

  // Build URL for pagination/filtering
  const buildUrl = (overrides = {}) => {
    const newParams = new URLSearchParams();
    const merged = { page, genre, sort, ...overrides };

    if (merged.page && merged.page > 1) newParams.set("page", merged.page);
    if (merged.genre) newParams.set("genre", merged.genre);
    if (merged.sort && merged.sort !== "year") newParams.set("sort", merged.sort);

    const qs = newParams.toString();
    return qs ? `/movies?${qs}` : "/movies";
  };

  // Current page URL for "from" context
  const currentPageUrl = buildUrl();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Movies</h1>
        <p className="text-muted-foreground">
          {total} movie{total !== 1 ? "s" : ""} found
          {genre && ` in "${genre}"`}
        </p>
      </header>

      {/* Filters */}
      <section className="space-y-4">
        {/* Genre Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" id="genre-filter-label">Filter by Genre</label>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="genre-filter-label">
            <Button
              asChild
              variant={!genre ? "default" : "outline"}
              size="sm"
            >
              <Link href={buildUrl({ genre: null, page: 1 })}>All</Link>
            </Button>
            {genres.map((g) => (
              <Button
                key={g.id}
                asChild
                variant={genre === g.slug ? "default" : "outline"}
                size="sm"
              >
                <Link href={buildUrl({ genre: g.slug, page: 1 })}>{g.name}</Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Sort Control */}
        <div>
          <label className="block text-sm font-medium mb-2" id="sort-label">Sort by</label>
          <div className="flex gap-2" role="group" aria-labelledby="sort-label">
            <Button
              asChild
              variant={sort === "year" ? "default" : "ghost"}
              size="sm"
            >
              <Link href={buildUrl({ sort: "year", page: 1 })}>Year (newest)</Link>
            </Button>
            <Button
              asChild
              variant={sort === "title" ? "default" : "ghost"}
              size="sm"
            >
              <Link href={buildUrl({ sort: "title", page: 1 })}>Title (A-Z)</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              showGenres={true}
              fromUrl={currentPageUrl}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No movies found matching your filters.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex justify-center gap-2" aria-label="Pagination">
          <Button
            asChild
            variant="outline"
            disabled={page <= 1}
          >
            <Link
              href={buildUrl({ page: page - 1 })}
              aria-disabled={page <= 1}
              tabIndex={page <= 1 ? -1 : undefined}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            >
              Previous
            </Link>
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            asChild
            variant="outline"
            disabled={page >= totalPages}
          >
            <Link
              href={buildUrl({ page: page + 1 })}
              aria-disabled={page >= totalPages}
              tabIndex={page >= totalPages ? -1 : undefined}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            >
              Next
            </Link>
          </Button>
        </nav>
      )}
    </div>
  );
}
