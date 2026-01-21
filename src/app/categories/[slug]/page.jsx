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
        orderBy: { rank: "asc" },
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

export default async function CategoryDetailPage({ params }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const isAdmin = await isAuthenticated();
  const picks = category.assignments;
  const hasAllPicks = picks.length === 3;

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

      {/* Admin warning if missing picks */}
      {isAdmin && !hasAllPicks && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">
              Admin notice: This category only has {picks.length}/3 picks assigned.{" "}
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
        {picks.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {picks.map((assignment) => (
              <MovieCard
                key={assignment.movieId}
                movie={assignment.movie}
                rank={assignment.rank}
                showOfficialSynopsis={true}
                showGenres={true}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No picks assigned to this category yet.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Metadata */}
      <footer className="border-t border-border pt-6 text-sm text-muted-foreground">
        <p>Category added {new Date(category.createdAt).toLocaleDateString()}</p>
      </footer>
    </article>
  );
}
