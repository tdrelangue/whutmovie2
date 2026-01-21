import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

async function getMovie(slug) {
  return prisma.movie.findUnique({
    where: { slug },
    include: {
      genres: true,
      categories: {
        include: {
          category: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    return { title: "Movie Not Found - WhutMovie" };
  }

  return {
    title: `${movie.title} - WhutMovie`,
    description: movie.whutSummary || `Details about ${movie.title}`,
  };
}

export default async function MovieDetailPage({ params }) {
  const { slug } = await params;
  const movie = await getMovie(slug);

  if (!movie) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto space-y-8">
      {/* Back Navigation */}
      <nav>
        <Button asChild variant="ghost" size="sm">
          <Link href="/movies">&larr; Back to Movies</Link>
        </Button>
      </nav>

      {/* Header */}
      <header className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{movie.title}</h1>
        {movie.year && (
          <p className="text-xl text-muted-foreground">{movie.year}</p>
        )}
      </header>

      {/* Poster Placeholder */}
      <Card className="aspect-video">
        <CardContent className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-sm">Poster coming soon</p>
          </div>
        </CardContent>
      </Card>

      {/* WhutSummary - Our funny summary (PRIMARY) */}
      {movie.whutSummary && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Our Take</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {movie.whutSummary}
          </p>
        </section>
      )}

      {/* Official Synopsis - Collapsed under details */}
      {movie.description && (
        <section>
          <details className="group">
            <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-2">
              <span className="group-open:rotate-90 transition-transform">▶</span>
              Official Synopsis
            </summary>
            <div className="mt-3 pl-4 border-l-2 border-border">
              <p className="text-muted-foreground leading-relaxed">
                {movie.description}
              </p>
            </div>
          </details>
        </section>
      )}

      {/* Genres */}
      {movie.genres.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <Badge key={genre.id} variant="outline" className="text-sm py-1 px-3">
                <Link
                  href={`/movies?genre=${genre.slug}`}
                  className="hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {genre.name}
                </Link>
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Category Assignments - Where this movie appears */}
      {movie.categories.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Featured In</h2>
          <div className="space-y-2">
            {movie.categories.map((ca) => (
              <Link
                key={ca.categoryId}
                href={`/categories/${ca.category.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Badge variant="default">#{ca.rank}</Badge>
                <span className="font-medium">{ca.category.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Metadata */}
      <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
        <p>Added on {new Date(movie.createdAt).toLocaleDateString()}</p>
      </footer>
    </article>
  );
}
