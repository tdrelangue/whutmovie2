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
 * @param {Object} props.movie - Movie object with title, slug, whutSummary, description, year, genres
 * @param {number} [props.rank] - Optional rank badge (1, 2, or 3)
 * @param {string} [props.angleLabel] - Optional angle label (e.g., "Action", "Rom-com twist") per category assignment
 * @param {boolean} [props.showOfficialSynopsis] - Whether to show official synopsis under details
 * @param {boolean} [props.showGenres] - Whether to show genre badges (default: true)
 * @param {string} [props.fromUrl] - Optional URL for context-aware back navigation
 * @param {string} [props.variant] - Optional variant: "default" | "secondary" (for honorable mentions)
 */
export function MovieCard({
  movie,
  rank,
  angleLabel,
  showOfficialSynopsis = false,
  showGenres = true,
  fromUrl,
  variant = "default",
}) {
  // Build movie detail URL with optional "from" param
  const movieUrl = fromUrl
    ? `/movies/${movie.slug}?from=${encodeURIComponent(fromUrl)}`
    : `/movies/${movie.slug}`;

  const isSecondary = variant === "secondary";

  return (
    <Card
      className={`transition-colors relative ${
        isSecondary
          ? "hover:border-muted-foreground/50 opacity-90"
          : "hover:border-primary/50"
      }`}
    >
      {/* Rank Badge */}
      {rank && (
        <div className="absolute -top-3 -right-3 z-10">
          <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
            #{rank}
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle className="line-clamp-1 text-lg">
          <Link
            href={movieUrl}
            className="inline-block rounded-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:underline hover:decoration-primary hover:decoration-2 hover:underline-offset-4"
          >
            {movie.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          {movie.year && <span>{movie.year}</span>}
          {angleLabel && (
            <Badge variant="secondary" className="text-xs">
              {angleLabel}
            </Badge>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* WhutSummary - our funny summary (primary) */}
        {movie.whutSummary && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {movie.whutSummary}
          </p>
        )}

        {/* Official Synopsis (collapsed) */}
        {showOfficialSynopsis && movie.description && (
          <details className="mb-4">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Official synopsis
            </summary>
            <p className="text-xs text-muted-foreground mt-2 pl-2 border-l border-border">
              {movie.description}
            </p>
          </details>
        )}

        {/* Genre badges */}
        {showGenres && movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.map((genre) => (
              <Badge key={genre.id} variant="outline">
                {genre.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
