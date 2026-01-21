import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LogoutButton from "./logout-button";

async function getStats() {
  const [movieCount, categoryCount, genreCount] = await Promise.all([
    prisma.movie.count(),
    prisma.category.count(),
    prisma.genre.count(),
  ]);
  return { movieCount, categoryCount, genreCount };
}

export const metadata = {
  title: "Admin Dashboard - WhutMovie",
};

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/admin/login");
  }

  const stats = await getStats();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}</p>
        </div>
        <LogoutButton />
      </header>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Categories</CardDescription>
            <CardTitle className="text-4xl">{stats.categoryCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Movies</CardDescription>
            <CardTitle className="text-4xl">{stats.movieCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Genres</CardDescription>
            <CardTitle className="text-4xl">{stats.genreCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Manage Content</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Create and manage curated categories with their 3 ranked picks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/categories">Manage Categories</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movies</CardTitle>
              <CardDescription>
                Add and edit movies with your unique WhutSummary descriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/movies">Manage Movies</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* External Tools */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Database Tools</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              For advanced database management, use Prisma Studio:
            </p>
            <code className="bg-muted px-3 py-2 rounded text-sm">
              npx prisma studio
            </code>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
