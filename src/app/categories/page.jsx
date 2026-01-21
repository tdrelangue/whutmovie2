import { prisma } from "@/lib/prisma";
import { CategoryCard } from "@/components/category-card";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Categories - WhutMovie",
  description: "Browse our curated movie categories - each with exactly 3 picks and way too much explanation.",
};

async function getCategories() {
  return prisma.category.findMany({
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

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Categories</h1>
        <p className="text-muted-foreground max-w-2xl">
          Each category is a carefully curated collection of exactly 3 movies, ranked in order of
          how much we think you should watch them. The descriptions are... thorough.
        </p>
      </header>

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
              No categories found. The database needs to be seeded with initial data.
            </p>
            <p className="text-sm text-muted-foreground">
              Run: <code className="bg-muted px-2 py-1 rounded">npx prisma db seed</code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
