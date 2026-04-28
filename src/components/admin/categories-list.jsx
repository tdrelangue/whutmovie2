"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function CategoriesList({ categories, deleteAction }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? categories.filter((c) =>
        c.title.toLowerCase().includes(query.toLowerCase())
      )
    : categories;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">
          All Categories ({categories.length})
        </h2>
        <Input
          type="search"
          placeholder="Search by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
          aria-label="Search categories"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {query
              ? `No categories matching "${query}"`
              : "No categories yet. Create one."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((category) => {
            const ranked = category.assignments
              .filter((a) => !a.isHonorableMention)
              .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
            const hms = category.assignments.filter((a) => a.isHonorableMention);

            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/categories/${category.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <form action={deleteAction}>
                        <input type="hidden" name="id" value={category.id} />
                        <Button type="submit" variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardHeader>
                {(ranked.length > 0 || hms.length > 0) && (
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {ranked.map((a) => (
                        <Badge key={a.movieId} variant="default">
                          #{a.rank} {a.movie.title}
                        </Badge>
                      ))}
                      {hms.map((a) => (
                        <Badge key={a.movieId} variant="secondary">
                          HM {a.movie.title}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
