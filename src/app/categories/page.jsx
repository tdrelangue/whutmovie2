import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/category-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Categories - WhutMovie",
  description: "Browse our curated movie categories - each with exactly 3 picks and way too much explanation.",
};

async function getCategories(genreFilter) {
  const categories = await prisma.category.findMany({
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

  const [categories, genres] = await Promise.all([
    getCategories(genreFilter),
    getGenres(),
  ]);

  // Build URL for filtering
  const buildUrl = (overrides = {}) => {
    const newParams = new URLSearchParams();
    const merged = { genre: genreFilter, ...overrides };

    if (merged.genre) newParams.set("genre", merged.genre);

    const qs = newParams.toString();
    return qs ? `/categories?${qs}` : "/categories";
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Categories</h1>
        <p className="text-muted-foreground max-w-2xl">
          Each category is a carefully curated collection of exactly 3 movies, ranked in order of
          how much we think you should watch them. The descriptions are... thorough.
        </p>
      </header>

      {/* Genre Filter */}
      <section className="space-y-2">
        <label className="block text-sm font-medium" id="genre-filter-label">
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
        {genreFilter && (
          <div className="pt-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={buildUrl({ genre: null })}>Clear filter</Link>
            </Button>
          </div>
        )}
      </section>

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
              {genreFilter
                ? "No categories found matching the selected genre."
                : "No categories found. The database needs to be seeded with initial data."}
            </p>
            {!genreFilter && (
              <p className="text-sm text-muted-foreground">
                Run: <code className="bg-muted px-2 py-1 rounded">npx prisma db seed</code>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
