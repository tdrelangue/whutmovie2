import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MovieCard } from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

async function getGroup(slug) {
  return prisma.movieGroup.findUnique({
    where: { slug },
    include: {
      members: {
        orderBy: { order: "asc" },
        include: {
          movie: { include: { genres: true } },
        },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const group = await getGroup(slug);
  if (!group) return { title: "Group Not Found - WhutMovie" };
  return {
    title: `${group.title} - WhutMovie`,
    description: group.description?.slice(0, 160) ?? undefined,
  };
}

export default async function GroupDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const fromUrl = resolvedSearchParams?.from ?? null;

  const group = await getGroup(slug);
  if (!group) notFound();

  const backHref = fromUrl ?? "/categories";
  const currentPageUrl = `/groups/${slug}`;

  return (
    <article className="max-w-4xl mx-auto space-y-8">
      <nav>
        <Button asChild variant="ghost" size="sm">
          <Link href={backHref}>&larr; Back</Link>
        </Button>
      </nav>

      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{group.title}</h1>
        {group.description && (
          <p className="text-lg text-muted-foreground leading-relaxed">
            {group.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {group.members.length} film{group.members.length !== 1 ? "s" : ""}
        </p>
      </header>

      <section>
        {group.members.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {group.members.map((member) => (
              <MovieCard
                key={member.id}
                movie={member.movie}
                showOfficialSynopsis={true}
                showGenres={true}
                spoilerHidden={member.spoilerHidden}
                fromUrl={currentPageUrl}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>No movies in this group yet.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </article>
  );
}
