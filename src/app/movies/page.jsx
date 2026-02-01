import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MovieCard } from "@/components/movie-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 12;

async function getMovies({ page = 1, genre, sort = "year", q }) {
  const where = {};

  if (genre) {
    where.genres = {
      some: {
        slug: genre,
      },
    };
  }

  // Search by title (case-insensitive)
  if (q && q.trim()) {
    where.title = {
      contains: q.trim(),
      mode: "insensitive",
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
  const q = params.q || "";

  const [{ movies, total, totalPages }, genres] = await Promise.all([
    getMovies({ page, genre, sort, q }),
    getGenres(),
  ]);

  // Build URL for pagination/filtering
  const buildUrl = (overrides = {}) => {
    const newParams = new URLSearchParams();
    const merged = { page, genre, sort, q, ...overrides };

    if (merged.page && merged.page > 1) newParams.set("page", merged.page);
    if (merged.genre) newParams.set("genre", merged.genre);
    if (merged.sort && merged.sort !== "year") newParams.set("sort", merged.sort);
    if (merged.q) newParams.set("q", merged.q);

    const qs = newParams.toString();
    return qs ? `/movies?${qs}` : "/movies";
  };

  // Current page URL for "from" context
  const currentPageUrl = buildUrl();

  // Check if any filters are active
  const hasActiveFilters = genre || q || sort !== "year";

  return (
    <div className="space-y-8">
      {/* Skip to results link */}
      <a href="#results" className="skip-link">
        Skip to results
      </a>

      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Movies</h1>
        <p className="text-muted-foreground">
          {total} movie{total !== 1 ? "s" : ""} found
          {genre && ` in "${genre}"`}
          {q && ` matching "${q}"`}
        </p>
      </header>

      {/* Filters in collapsible details */}
      <details className="filters-details" open={hasActiveFilters}>
        <summary>Filters and sorting</summary>

        <div className="mt-4 space-y-4 pl-1">
          {/* Search Input */}
          <div>
            <label htmlFor="movie-search" className="block text-sm font-medium mb-2">
              Search by title
            </label>
            <form action="/movies" method="GET" className="flex gap-2 max-w-md">
              {/* Preserve existing filters */}
              {genre && <input type="hidden" name="genre" value={genre} />}
              {sort !== "year" && <input type="hidden" name="sort" value={sort} />}
              <Input
                type="search"
                id="movie-search"
                name="q"
                defaultValue={q}
                placeholder="e.g., Batman, Matrix..."
                className="flex-1"
              />
              <Button type="submit">Search</Button>
            </form>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="block text-sm font-medium mb-2" id="genre-filter-label">
              Filter by Genre
            </label>
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
            <label className="block text-sm font-medium mb-2" id="sort-label">
              Sort by
            </label>
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

          {/* Clear filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-border">
              <Button asChild variant="ghost" size="sm">
                <Link href="/movies">Clear all filters</Link>
              </Button>
            </div>
          )}
        </div>
      </details>

      {/* Results section */}
      <section id="results" aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">Results</h2>

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
              {hasActiveFilters && (
                <Button asChild variant="link" className="mt-2">
                  <Link href="/movies">Clear filters</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </section>

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
