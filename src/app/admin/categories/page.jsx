import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { CategoriesList } from "@/components/admin/categories-list";

export const metadata = {
  title: "Manage Categories - WhutMovie Admin",
};

async function getCategories() {
  return prisma.category.findMany({
    orderBy: { title: "asc" },
    include: {
      assignments: {
        orderBy: { rank: "asc" },
        include: {
          movie: { select: { id: true, title: true } },
        },
      },
    },
  });
}

async function deleteCategory(formData) {
  "use server";

  const id = formData.get("id")?.toString();
  if (!id) return;

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  revalidatePath("/");
}

export default async function AdminCategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const categories = await getCategories();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Categories
          </h1>
          <p className="text-muted-foreground">
            Create categories and assign their ranked picks
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">+ New Category</Link>
        </Button>
      </header>

      <CategoriesList categories={categories} deleteAction={deleteCategory} />
    </div>
  );
}
