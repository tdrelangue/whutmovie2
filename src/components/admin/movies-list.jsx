"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function MoviesList({ movies, deleteAction }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? movies.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase())
      )
    : movies;

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">
          All Movies ({movies.length})
        </h2>
        <Input
          type="search"
          placeholder="Search by title…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
          aria-label="Search movies"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {query ? `No movies matching "${query}"` : "No movies yet. Add one above."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((movie) => (
            <Card key={movie.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      {movie.title}
                      {movie.year && (
                        <span className="text-muted-foreground font-normal">
                          ({movie.year})
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1 line-clamp-2">
                      {movie.whutSummary}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/movies/${movie.id}`}>Edit</Link>
                    </Button>
                    <form action={deleteAction}>
                      <input type="hidden" name="id" value={movie.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {movie.genres.map((g) => (
                    <Badge key={g.id} variant="outline">
                      {g.name}
                    </Badge>
                  ))}
                  {movie.categories.map((ca) => (
                    <Badge key={ca.categoryId} variant="secondary">
                      {ca.category.title}
                      {ca.rank ? ` #${ca.rank}` : " (HM)"}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
