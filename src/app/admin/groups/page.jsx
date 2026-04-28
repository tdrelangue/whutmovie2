import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Movie Groups - WhutMovie Admin" };

async function getGroups() {
  return prisma.movieGroup.findMany({
    orderBy: { title: "asc" },
    include: {
      members: {
        orderBy: { order: "asc" },
        include: { movie: { select: { title: true } } },
      },
    },
  });
}

async function deleteGroup(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.movieGroup.delete({ where: { id } });
  revalidatePath("/admin/groups");
}

export default async function AdminGroupsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const groups = await getGroups();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movie Groups</h1>
          <p className="text-muted-foreground">
            Trilogies, sagas, and series to use inside categories
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/groups/new">+ New Group</Link>
        </Button>
      </header>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No groups yet. Create one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{group.title}</CardTitle>
                    {group.description && (
                      <CardDescription className="mt-1 line-clamp-1">
                        {group.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/groups/${group.id}`}>Edit</Link>
                    </Button>
                    <form action={deleteGroup}>
                      <input type="hidden" name="id" value={group.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              {group.members.length > 0 && (
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {group.members.map((m, i) => (
                      <Badge key={m.id} variant={m.spoilerHidden ? "secondary" : "outline"}>
                        {i + 1}. {m.movie.title}
                        {m.spoilerHidden && " 🔒"}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
