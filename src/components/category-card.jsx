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
  const isGroupCategory = category.categoryType === "GROUPS";

  const moviePicks = !isGroupCategory && category.assignments
    ? [...category.assignments]
        .filter((a) => a.rank !== null && !a.isHonorableMention)
        .sort((a, b) => a.rank - b.rank)
    : [];

  const groupPicks = isGroupCategory && category.groupAssignments
    ? [...category.groupAssignments].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    : [];

  const hasPicks = isGroupCategory ? groupPicks.length > 0 : moviePicks.length > 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
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
          {hasPicks ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Top 3 Picks
              </p>
              <div className="space-y-1">
                {isGroupCategory
                  ? groupPicks.map((ga) => (
                      <div key={ga.id} className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs px-1.5 py-0">
                          #{ga.rank}
                        </Badge>
                        <span className="text-sm text-foreground truncate">
                          {ga.group.title}
                        </span>
                      </div>
                    ))
                  : moviePicks.map((a) => (
                      <div key={a.movieId} className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs px-1.5 py-0">
                          #{a.rank}
                        </Badge>
                        <span className="text-sm text-foreground truncate">
                          {a.movie.title}
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

          <div className="mt-4">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-foreground bg-primary rounded-md px-3 py-1.5 transition-all group-hover:bg-primary/90 group-hover:shadow-md">
              View category <span aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
