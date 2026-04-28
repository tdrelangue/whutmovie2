import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <div>
      <nav className="flex items-center gap-3 text-sm mb-6 pb-4 border-b border-border flex-wrap">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Public site
        </Link>
        <span className="text-border">|</span>
        <Link
          href="/admin"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-border">/</span>
        <Link
          href="/admin/movies"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Movies
        </Link>
        <span className="text-border">/</span>
        <Link
          href="/admin/categories"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Categories
        </Link>
        <span className="text-border">/</span>
        <Link
          href="/admin/data"
          className="font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Data
        </Link>
        {user && (
          <span className="ml-auto text-xs text-muted-foreground">
            @{user.username}
          </span>
        )}
      </nav>
      {children}
    </div>
  );
}
