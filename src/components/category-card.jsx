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
 * CategoryCard component - displays a category in card format (matches MovieCard styling)
 * @param {Object} props
 * @param {Object} props.category - Category object with title, slug, description, assignments
 */
export function CategoryCard({ category }) {
  // Get only ranked picks (not honorable mentions), sorted by rank
  const picks = category.assignments
    ? [...category.assignments]
        .filter((a) => a.rank !== null && !a.isHonorableMention)
        .sort((a, b) => a.rank - b.rank)
    : [];

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="hover:border-primary/50 transition-colors h-full">
        <CardHeader>
          <CardTitle className="line-clamp-1 text-lg">
            {category.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {category.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Preview of the 3 picks */}
          {picks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Top 3 Picks
              </p>
              <div className="space-y-1">
                {picks.map((assignment) => (
                  <div
                    key={assignment.movieId}
                    className="flex items-center gap-2"
                  >
                    <Badge variant="default" className="text-xs px-1.5 py-0">
                      #{assignment.rank}
                    </Badge>
                    <span className="text-sm text-foreground truncate">
                      {assignment.movie.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No picks yet
            </p>
          )}

          {/* View affordance */}
          <div className="mt-4 text-sm text-primary font-medium">
            View category &rarr;
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
