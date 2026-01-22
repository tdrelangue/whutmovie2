import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { isAuthenticated } from "@/lib/auth";

async function getCategory(slug) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      assignments: {
        include: {
          movie: {
            include: {
              genres: true,
            },
          },
        },
      },
    },
  });
}

async function getGenres() {
  return prisma.genre.findMany({ orderBy: { name: "asc" } });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Category Not Found - WhutMovie" };
  }

  return {
    title: `${category.title} - WhutMovie`,
    description: category.description.slice(0, 160),
  };
}

export default async function CategoryDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const genreFilter = resolvedSearchParams.genre || null;

  const [category, genres] = await Promise.all([
    getCategory(slug),
    getGenres(),
  ]);

  if (!category) {
    notFound();
  }

  const isAdmin = await isAuthenticated();

  // Separate ranked picks from honorable mentions
  const allAssignments = category.assignments;

  // Filter function for genre
  const matchesGenre = (assignment) => {
    if (!genreFilter) return true;
    return assignment.movie.genres.some((g) => g.slug === genreFilter);
  };

  // Ranked picks: rank 1-3, ordered by rank
  const rankedPicks = allAssignments
    .filter((a) => a.rank !== null && !a.isHonorableMention)
    .sort((a, b) => a.rank - b.rank)
    .filter(matchesGenre);

  // Honorable mentions: isHonorableMention = true, ordered by movie title
  const honorableMentions = allAssignments
    .filter((a) => a.isHonorableMention === true)
    .sort((a, b) => a.movie.title.localeCompare(b.movie.title))
    .filter(matchesGenre);

  // Count unfiltered ranked picks for admin notice
  const totalRankedPicks = allAssignments.filter(
    (a) => a.rank !== null && !a.isHonorableMention
  ).length;
  const hasAllPicks = totalRankedPicks >= 3;

  // Build URL for filtering
  const buildUrl = (overrides = {}) => {
    const newParams = new URLSearchParams();
    const merged = { genre: genreFilter, ...overrides };

    if (merged.genre) newParams.set("genre", merged.genre);

    const qs = newParams.toString();
    return qs ? `/categories/${slug}?${qs}` : `/categories/${slug}`;
  };

  // Build the current page URL for "from" context
  const currentPageUrl = buildUrl();

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      {/* Back Navigation */}
      <nav>
        <Button asChild variant="ghost" size="sm">
          <Link href="/categories">&larr; Back to Categories</Link>
        </Button>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{category.title}</h1>
      </header>

      {/* The "over-explained" description */}
      <section className="prose prose-invert max-w-none">
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
          {category.description}
        </p>
      </section>

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

      {/* Admin warning if missing picks */}
      {isAdmin && !hasAllPicks && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">
              Admin notice: This category only has {totalRankedPicks}/3 picks assigned.{" "}
              <Link href="/admin/categories" className="underline hover:text-destructive/80">
                Add more picks
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* The 3 ranked movie picks */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">The Picks</h2>
        {rankedPicks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rankedPicks.map((assignment) => (
              <MovieCard
                key={assignment.movieId}
                movie={assignment.movie}
                rank={assignment.rank}
                showOfficialSynopsis={true}
                showGenres={true}
                fromUrl={currentPageUrl}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>
                {genreFilter
                  ? "No picks match the selected genre."
                  : "No picks assigned to this category yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Honorable Mentions (only if present) */}
      {honorableMentions.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">Honorable Mentions</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {honorableMentions.map((assignment) => (
              <MovieCard
                key={assignment.movieId}
                movie={assignment.movie}
                showOfficialSynopsis={true}
                showGenres={true}
                fromUrl={currentPageUrl}
                variant="secondary"
              />
            ))}
          </div>
        </section>
      )}

      {/* Metadata */}
      <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
        <p>Category added {new Date(category.createdAt).toLocaleDateString()}</p>
      </footer>
    </article>
  );
}
