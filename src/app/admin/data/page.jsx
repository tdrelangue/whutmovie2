import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ImportExportPanel } from "@/components/admin/import-export-panel";

export const metadata = {
  title: "Data - WhutMovie Admin",
};

export default async function AdminDataPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Data</h1>
        <p className="text-muted-foreground">
          Export a snapshot of your database or import a JSON batch update
        </p>
      </header>

      <ImportExportPanel />
    </div>
  );
}
