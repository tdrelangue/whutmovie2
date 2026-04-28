import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpoilerSummary } from "@/components/spoiler-summary";

function GroupMemberCard({ member, fromUrl }) {
  const { movie, spoilerHidden } = member;
  const movieUrl = fromUrl
    ? `/movies/${movie.slug}?from=${encodeURIComponent(fromUrl)}`
    : `/movies/${movie.slug}`;

  return (
    <Card className="transition-colors hover:border-primary/50 relative overflow-hidden flex flex-col">
      <Link
        href={movieUrl}
        className="block relative aspect-[2/3] bg-muted shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-5xl">
            🎬
          </div>
        )}
      </Link>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-base leading-tight">
          <Link
            href={movieUrl}
            className="hover:underline hover:decoration-primary hover:decoration-2 hover:underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {movie.title}
          </Link>
        </CardTitle>
        <CardDescription>{movie.year}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col">
        <SpoilerSummary text={movie.whutSummary} hidden={spoilerHidden} />

        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {movie.genres.map((g) => (
              <Badge key={g.id} variant="outline" className="text-xs">
                {g.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MovieGroupSection({ group, fromUrl, rank }) {
  const referencePoster = group.members.find((m) => m.movie.posterUrl)?.movie.posterUrl ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {referencePoster && (
          <div className="relative w-12 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
            <Image
              src={referencePoster}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            {rank != null && (
              <Badge className="w-8 justify-center shrink-0">#{rank}</Badge>
            )}
            <h3 className="text-xl font-semibold">{group.title}</h3>
          </div>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          )}
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {group.members.map((member) => (
          <GroupMemberCard key={member.id} member={member} fromUrl={fromUrl} />
        ))}
      </div>
    </div>
  );
}
