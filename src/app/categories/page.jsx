import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/category-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Categories - WhutMovie",
  description: "Browse my curated movie categories - each with 3 picks and way too much explanation.",
};

async function getCategories({ genreFilter, q }) {
  const where = {};

  // Search by title only (case-insensitive)
  if (q && q.trim()) {
    where.title = {
      contains: q.trim(),
      mode: "insensitive",
    };
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      assignments: {
        where: {
          // Only include ranked picks (not honorable mentions)
          isHonorableMention: false,
          rank: { not: null },
        },
        orderBy: { rank: "asc" },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              slug: true,
              genres: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // If genre filter is applied, filter categories to those with picks matching the genre
  if (genreFilter) {
    return categories.filter((category) =>
      category.assignments.some((a) =>
        a.movie.genres.some((g) => g.slug === genreFilter)
      )
    );
  }

  return categories;
}

async function getGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" } });
}

export default async function CategoriesPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const genreFilter = resolvedSearchParams?.genre || null;
  const q = resolvedSearchParams?.q || "";

  const [categories, genres] = await Promise.all([
    getCategories({ genreFilter, q }),
    getGenres(),
  ]);

  // Build URL for filtering
  const buildUrl = (overrides = {}) => {
    const newParams = new URLSearchParams();
    const merged = { genre: genreFilter, q, ...overrides };

    if (merged.genre) newParams.set("genre", merged.genre);
    if (merged.q) newParams.set("q", merged.q);

    const qs = newParams.toString();
    return qs ? `/categories?${qs}` : "/categories";
  };

  // Check if any filters are active
  const hasActiveFilters = genreFilter || q;

  return (
    <div className="space-y-8">
      {/* Skip to results link */}
      <a href="#results" className="skip-link">
        Skip to results
      </a>

      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Categories</h1>
        <p className="text-muted-foreground max-w-2xl">
          Each category is a carefully curated collection of exactly 3 movies, ranked in order of
          how much I think you should watch them. The descriptions are... thorough.
        </p>
        {(q || genreFilter) && (
          <p className="text-muted-foreground mt-2">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"} found
            {q && ` matching "${q}"`}
            {genreFilter && ` with "${genreFilter}" movies`}
          </p>
        )}
      </header>

      {/* Filters in collapsible details */}
      <details className="filters-details" open={hasActiveFilters}>
        <summary>Filters</summary>

        <div className="mt-4 space-y-4 pl-1">
          {/* Search Input */}
          <div>
            <label htmlFor="category-search" className="block text-sm font-medium mb-2">
              Search by category title
            </label>
            <form action="/categories" method="GET" className="flex gap-2 max-w-md">
              {/* Preserve existing filters */}
              {genreFilter && <input type="hidden" name="genre" value={genreFilter} />}
              <Input
                type="search"
                id="category-search"
                name="q"
                defaultValue={q}
                placeholder="e.g., Best, Underrated..."
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
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="genre-filter-label"
            >
              <Button
                asChild
                variant={!genreFilter ? "default" : "outline"}
                size="sm"
              >
                <Link href={buildUrl({ genre: null })}>All</Link>
              </Button>
              {genres.map((g) => (
                <Button
                  key={g.id}
                  asChild
                  variant={genreFilter === g.slug ? "default" : "outline"}
                  size="sm"
                >
                  <Link href={buildUrl({ genre: g.slug })}>{g.name}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-border">
              <Button asChild variant="ghost" size="sm">
                <Link href="/categories">Clear all filters</Link>
              </Button>
            </div>
          )}
        </div>
      </details>

      {/* Results section */}
      <section id="results" aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">Results</h2>

        {categories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "No categories found matching your filters."
                  : "No categories found. The database needs to be seeded with initial data."}
              </p>
              {hasActiveFilters ? (
                <Button asChild variant="link">
                  <Link href="/categories">Clear filters</Link>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Run: <code className="bg-muted px-2 py-1 rounded">npx prisma db seed</code>
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
