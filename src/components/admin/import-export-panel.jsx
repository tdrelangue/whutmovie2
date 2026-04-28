"use client";

import { useActionState, useRef, useState } from "react";
import { importData } from "@/app/admin/data/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ImportExportPanel() {
  const [state, formAction, isPending] = useActionState(importData, null);
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  function handleFileChange(e) {
    setFileName(e.target.files?.[0]?.name ?? null);
  }

  return (
    <div className="space-y-8">
      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>
            Download the full database as a JSON snapshot — movies, categories,
            genres, and manual streaming links.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/api/admin/export" download>
            <Button variant="outline">Download JSON</Button>
          </a>
          <p className="text-xs text-muted-foreground mt-2">
            The file can be used as a backup or as the template for a batch
            import.
          </p>
        </CardContent>
      </Card>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle>Import</CardTitle>
          <CardDescription>
            Drop a JSON file to batch-create or update movies and categories.
            Uses the same format as the export. Existing records are updated by
            slug; new ones are created. Category assignments are replaced by
            what is in the file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={formAction} className="space-y-4">
            {/* Drop zone */}
            <label
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-10 text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                // Programmatically assign to the hidden input
                const dt = new DataTransfer();
                dt.items.add(file);
                inputRef.current.files = dt.files;
                setFileName(file.name);
              }}
            >
              <span className="text-3xl" aria-hidden="true">📂</span>
              {fileName ? (
                <span className="text-sm font-medium text-primary">{fileName}</span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Drop a .json file here, or click to browse
                </span>
              )}
              <input
                ref={inputRef}
                type="file"
                name="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={handleFileChange}
              />
            </label>

            <Button type="submit" disabled={isPending || !fileName}>
              {isPending ? "Importing…" : "Import"}
            </Button>
          </form>

          {/* Results */}
          {state?.error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 text-destructive p-4 text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="rounded-md bg-green-500/10 border border-green-500/30 p-4 space-y-3">
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                ✓ Import complete
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="outline">
                  {state.stats.genresUpserted} genres
                </Badge>
                <Badge variant="outline">
                  {state.stats.moviesCreated} movies created
                </Badge>
                <Badge variant="outline">
                  {state.stats.moviesUpdated} movies updated
                </Badge>
                <Badge variant="outline">
                  {state.stats.categoriesCreated} categories created
                </Badge>
                <Badge variant="outline">
                  {state.stats.categoriesUpdated} categories updated
                </Badge>
                <Badge variant="outline">
                  {state.stats.assignmentsWritten} assignments
                </Badge>
              </div>
              {state.stats.errors.length > 0 && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground">
                    {state.stats.errors.length} warning
                    {state.stats.errors.length > 1 ? "s" : ""}
                  </summary>
                  <ul className="mt-2 space-y-1 text-muted-foreground list-disc pl-4">
                    {state.stats.errors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
