"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/movies", label: "Movies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          WhutMovie
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-6 md:flex" aria-label="Main navigation">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={
                "text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 " +
                (isActive(l.href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/get-started">Get started</Link>
          </Button>
        </div>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-card">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="mb-6">
              <Link href="/" className="text-lg font-bold text-foreground" aria-label="WhutMovie Home">
                WhutMovie
              </Link>
            </div>
            <nav className="grid gap-3" aria-label="Mobile navigation">
              {links.map((l) => (
                <SheetClose asChild key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={
                      "text-sm font-medium py-2 px-1 rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
                      (isActive(l.href)
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {l.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <div className="mt-6 grid gap-2">
              <SheetClose asChild>
                <Button asChild variant="outline">
                  <Link href="/signin">Sign in</Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild>
                  <Link href="/get-started">Get started</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
