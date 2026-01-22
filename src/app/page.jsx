import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/category-card";
import { MovieCard } from "@/components/movie-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getFeaturedCategories() {
  return prisma.category.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      assignments: {
        orderBy: { rank: "asc" },
        include: {
          movie: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });
}

async function getLatestMovies() {
  return prisma.movie.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      genres: true,
    },
  });
}

export default async function HomePage() {
  const [categories, movies] = await Promise.all([
    getFeaturedCategories(),
    getLatestMovies(),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero / Concept Introduction */}
      <section className="py-12 space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          WhutMovie
        </h1>
        <div className="max-w-3xl space-y-4 text-lg text-muted-foreground leading-relaxed">
          <p>
            Look, I get it. You&apos;re tired of scrolling through Netflix for 45 minutes only to
            rewatch The Office again. Or worse, you ask a friend for a recommendation and they say
            &quot;oh you HAVE to watch this French film about a guy who stares at bread for 3 hours,
            it&apos;s really about capitalism.&quot;
          </p>
          <p>
            That&apos;s not us. I&apos;m the friend who actually watches movies and can tell you
            which ones are worth your precious free time. Each category is a curated list of exactly
            3 films, ranked in order of &quot;you should definitely watch this&quot; to &quot;okay this
            one&apos;s pretty good too.&quot;
          </p>
          <p>
            No algorithms. No sponsored content. No pretentious film school takes (okay, maybe a few).
            Just honest recommendations with way too much explanation about why I picked them. 
          </p>
          <p>
            You wanna watch a movie, I tell you WhutMovie !
          </p>
        </div>
        <div className="flex gap-4 pt-4">
          <Button asChild size="lg">
            <Link href="/categories">Browse Categories</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/movies">All Movies</Link>
          </Button>
        </div>
      </section>

      {/* Featured Categories - The Main Product */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Featured Categories</h2>
            <p className="text-muted-foreground mt-1">
              Each one has exactly 3 picks. I don&apos;t do &quot;top 10&quot; lists here.
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/categories">View all &rarr;</Link>
          </Button>
        </div>
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
                No categories found. Time to seed the database.
              </p>
              <p className="text-sm text-muted-foreground">
                Run: <code className="bg-muted px-2 py-1 rounded">npx prisma db seed</code>
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Latest Movies - Secondary */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Latest Movies</h2>
            <p className="text-muted-foreground mt-1">
              Recently added to our collection
            </p>
          </div>
          <Button asChild variant="ghost">
            <Link href="/movies">View all &rarr;</Link>
          </Button>
        </div>
        {movies.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showGenres={true} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No movies yet. Check back soon.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
