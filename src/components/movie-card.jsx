"use client";

import { useState } from "react";
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

/**
 * MovieCard component - displays a movie in card format
 * @param {Object} props
 * @param {Object} props.movie - Movie object
 * @param {number} [props.rank] - Optional rank badge (1, 2, or 3)
 * @param {string} [props.angleLabel] - Optional angle label per category assignment
 * @param {boolean} [props.showOfficialSynopsis] - Whether to show official synopsis under details
 * @param {boolean} [props.showGenres] - Whether to show genre badges (default: true)
 * @param {string} [props.fromUrl] - Optional URL for context-aware back navigation
 * @param {string} [props.variant] - "default" | "secondary" (for honorable mentions)
 */
export function MovieCard({
  movie,
  rank,
  angleLabel,
  showOfficialSynopsis = false,
  showGenres = true,
  spoilerHidden = false,
  fromUrl,
  variant = "default",
}) {
  const [revealed, setRevealed] = useState(!spoilerHidden);

  const movieUrl = fromUrl
    ? `/movies/${movie.slug}?from=${encodeURIComponent(fromUrl)}`
    : `/movies/${movie.slug}`;

  const isSecondary = variant === "secondary";

  return (
    <Card
      className={`transition-colors relative overflow-hidden flex flex-col ${
        isSecondary
          ? "hover:border-muted-foreground/50 opacity-90"
          : "hover:border-primary/50"
      }`}
    >
      {/* Rank Badge */}
      {rank && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
            #{rank}
          </div>
        </div>
      )}

      {/* Poster */}
      <Link href={movieUrl} className="block relative aspect-[2/3] bg-muted shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
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
            href={movieUrl}
            className="hover:underline hover:decoration-primary hover:decoration-2 hover:underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {movie.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 flex-wrap">
          {movie.year && <span>{movie.year}</span>}
          {angleLabel && (
            <Badge variant="secondary" className="text-xs">
              {angleLabel}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        {/* WhutSummary — blurred until revealed when spoilerHidden */}
        {movie.whutSummary && (
          revealed ? (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {movie.whutSummary}
            </p>
          ) : (
            <div className="relative mb-3">
              <p className="text-sm text-muted-foreground line-clamp-3 blur-sm select-none" aria-hidden="true">
                {movie.whutSummary}
              </p>
              <button
                onClick={() => setRevealed(true)}
                className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs font-medium bg-background/80 rounded-md hover:bg-background/95 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>🔒</span> Reveal summary (spoiler)
              </button>
            </div>
          )
        )}

        {/* Official synopsis — hidden until revealed when spoilerHidden */}
        {revealed && showOfficialSynopsis && movie.description && (
          <details className="mb-3">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Official synopsis
            </summary>
            <p className="text-xs text-muted-foreground mt-2 pl-2 border-l border-border">
              {movie.description}
            </p>
          </details>
        )}

        {/* Genre badges always visible */}
        {showGenres && movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {movie.genres.map((genre) => (
              <Badge key={genre.id} variant="outline" className="text-xs">
                {genre.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
