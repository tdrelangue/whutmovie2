import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "New Group - WhutMovie Admin" };

async function createGroup(formData) {
  "use server";

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim() || null;

  if (!title) return;

  const slug = slugify(title);

  let group;
  try {
    group = await prisma.movieGroup.create({ data: { title, slug, description } });
  } catch (e) {
    if (e.code !== "P2002") throw e;
    return;
  }

  revalidatePath("/admin/groups");
  redirect(`/admin/groups/${group.id}?saved=1`);
}

export default async function NewGroupPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/groups">&larr; Back to Groups</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">New Group</h1>
        <p className="text-muted-foreground">
          Create a trilogy, saga, or series — then add movies on the next screen
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createGroup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                required
                placeholder="e.g., The Lord of the Rings Trilogy"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                placeholder="A short note about this group…"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Group</Button>
              <Button asChild variant="outline">
                <Link href="/admin/groups">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
