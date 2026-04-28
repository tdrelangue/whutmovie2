import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SaveBanner } from "@/components/admin/save-banner";

export const metadata = { title: "Edit Group - WhutMovie Admin" };

async function getGroup(id) {
  return prisma.movieGroup.findUnique({
    where: { id },
    include: {
      members: {
        orderBy: { order: "asc" },
        include: { movie: { select: { id: true, title: true, year: true } } },
      },
    },
  });
}

async function getMovies() {
  return prisma.movie.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, year: true },
  });
}

async function saveGroup(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;
  if (!id || !title) return;
  const slug = slugify(title);
  try {
    await prisma.movieGroup.update({ where: { id }, data: { title, slug, description } });
  } catch (e) {
    if (e.code !== "P2002") throw e;
    return;
  }
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("order-")) {
      const memberId = key.slice("order-".length);
      const order = parseInt(val) || 0;
      await prisma.movieGroupMember.update({ where: { id: memberId }, data: { order } });
    }
  }
  for (const [key, val] of formData.entries()) {
    if (key.startsWith("spoiler-")) {
      const memberId = key.slice("spoiler-".length);
      await prisma.movieGroupMember.update({
        where: { id: memberId },
        data: { spoilerHidden: val === "true" },
      });
    }
  }
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${id}`);
  redirect(`/admin/groups/${id}?saved=1`);
}

async function addMember(formData) {
  "use server";
  const groupId = formData.get("groupId")?.toString();
  const movieId = formData.get("movieId")?.toString();
  if (!groupId || !movieId) return;
  const count = await prisma.movieGroupMember.count({ where: { groupId } });
  try {
    await prisma.movieGroupMember.create({ data: { groupId, movieId, order: count } });
  } catch (e) {
    if (e.code !== "P2002") throw e;
    return;
  }
  revalidatePath(`/admin/groups/${groupId}`);
}

async function removeMember(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  const groupId = formData.get("groupId")?.toString();
  if (!id) return;
  await prisma.movieGroupMember.delete({ where: { id } });
  revalidatePath(`/admin/groups/${groupId}`);
}

async function deleteGroup(formData) {
  "use server";
  const id = formData.get("id")?.toString();
  if (!id) return;
  await prisma.movieGroup.delete({ where: { id } });
  revalidatePath("/admin/groups");
  redirect("/admin/groups");
}

export default async function EditGroupPage({ params, searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;
  const resolvedSearch = await searchParams;
  const saved = resolvedSearch?.saved === "1";

  const [group, movies] = await Promise.all([getGroup(id), getMovies()]);
  if (!group) notFound();

  const memberMovieIds = group.members.map((m) => m.movieId);
  const availableMovies = movies.filter((m) => !memberMovieIds.includes(m.id));

  return (
    <>
      <SaveBanner show={saved} />

      <div className="space-y-8">
        <header>
          <div className="mb-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/groups">&larr; Back to Groups</Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Group</h1>
          <p className="text-muted-foreground">Editing: {group.title}</p>
        </header>

        <form id="group-form" action={saveGroup}>
          <input type="hidden" name="id" value={group.id} />
          <Card>
            <CardHeader>
              <CardTitle>Group Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  Title *
                </label>
                <Input id="title" name="title" required defaultValue={group.title} />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={group.description || ""}
                  placeholder="A short note about this group…"
                />
              </div>
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Movies in this Group</CardTitle>
            <CardDescription>
              Set display order and toggle spoiler protection per film
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {group.members.length > 0 ? (
              <div className="space-y-3">
                {group.members.map((m) => (
                  <div key={m.id} className="p-3 bg-muted rounded space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex-1 font-medium min-w-0">
                        {m.movie.title}
                        {m.movie.year && (
                          <span className="text-muted-foreground ml-1">({m.movie.year})</span>
                        )}
                      </span>
                      <form action={removeMember} className="shrink-0">
                        <input type="hidden" name="id" value={m.id} />
                        <input type="hidden" name="groupId" value={group.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Remove
                        </Button>
                      </form>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`order-${m.id}`}
                          className="text-xs text-muted-foreground whitespace-nowrap"
                        >
                          Order:
                        </label>
                        <Input
                          id={`order-${m.id}`}
                          form="group-form"
                          name={`order-${m.id}`}
                          type="number"
                          defaultValue={m.order}
                          className="h-8 w-20 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground whitespace-nowrap">
                          Summary spoiler:
                        </label>
                        <select
                          form="group-form"
                          name={`spoiler-${m.id}`}
                          defaultValue={m.spoilerHidden ? "true" : "false"}
                          className="h-8 rounded-md border border-input px-2 text-sm bg-background"
                        >
                          <option value="false">Visible</option>
                          <option value="true">Hidden (blurred)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No movies yet. Add one below.
              </p>
            )}

            {availableMovies.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Add a movie:</p>
                <form action={addMember} className="flex gap-2 items-end flex-wrap">
                  <input type="hidden" name="groupId" value={group.id} />
                  <div className="flex-1 min-w-[200px]">
                    <select
                      name="movieId"
                      required
                      className="w-full h-9 rounded-md border border-input px-3 text-sm bg-background"
                    >
                      <option value="">Select a movie…</option>
                      {availableMovies.map((mv) => (
                        <option key={mv.id} value={mv.id}>
                          {mv.title}
                          {mv.year ? ` (${mv.year})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" size="sm">
                    Add Movie
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button form="group-form" type="submit" size="lg">
            Save All Changes
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/groups">Cancel</Link>
          </Button>
        </div>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently delete this group and remove it from all categories</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={deleteGroup}>
              <input type="hidden" name="id" value={group.id} />
              <Button type="submit" variant="destructive">
                Delete Group
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
