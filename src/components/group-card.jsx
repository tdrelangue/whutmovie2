import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function GroupCard({ group, rank, angleLabel, fromUrl, variant = "default" }) {
  const groupUrl = fromUrl
    ? `/groups/${group.slug}?from=${encodeURIComponent(fromUrl)}`
    : `/groups/${group.slug}`;

  const referencePoster = group.members?.find((m) => m.movie.posterUrl)?.movie.posterUrl ?? null;
  const isSecondary = variant === "secondary";

  return (
    <Card
      className={`transition-colors relative overflow-hidden flex flex-col ${
        isSecondary
          ? "hover:border-muted-foreground/50 opacity-90"
          : "hover:border-primary/50"
      }`}
    >
      {rank && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
            #{rank}
          </div>
        </div>
      )}

      {/* Reference poster */}
      <Link
        href={groupUrl}
        className="block relative aspect-[2/3] bg-muted shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        {referencePoster ? (
          <Image
            src={referencePoster}
            alt={`${group.title} reference poster`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
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
            href={groupUrl}
            className="hover:underline hover:decoration-primary hover:decoration-2 hover:underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {group.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 flex-wrap">
          <span>{group.members?.length ?? 0} films</span>
          {angleLabel && (
            <Badge variant="secondary" className="text-xs">
              {angleLabel}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      {group.description && (
        <CardContent className="pt-0 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {group.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
