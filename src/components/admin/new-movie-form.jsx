"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NewMovieForm({ createAction, genres }) {
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [tmdbId, setTmdbId] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  async function fetchFromTmdb() {
    if (!title.trim()) {
      setFetchError("Enter a title first");
      return;
    }
    setLoading(true);
    setFetchError(null);
    setPreview(null);
    const params = new URLSearchParams();
    if (tmdbId) {
      params.set("tmdbId", tmdbId);
    } else {
      params.set("title", title.trim());
      if (year) params.set("year", year);
    }
    try {
      const res = await fetch(`/api/admin/tmdb-fetch?${params}`);
      const data = await res.json();
      if (!res.ok) { setFetchError(data.error || "Fetch failed"); return; }
      setPreview(data);
    } catch {
      setFetchError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function applyPreview() {
    if (!preview) return;
    if (preview.description) setDescription(preview.description);
    if (preview.posterUrl) setPosterUrl(preview.posterUrl);
    if (preview.tmdbId) setTmdbId(String(preview.tmdbId));
    setPreview(null);
  }

  return (
    <form action={createAction} className="space-y-4">
      <input type="hidden" name="posterUrl" value={posterUrl} />
      <input type="hidden" name="tmdbId" value={tmdbId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">Title *</label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Movie title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="year" className="block text-sm font-medium">Year</label>
          <Input
            id="year"
            name="year"
            type="number"
            min="1900"
            max="2100"
            placeholder="2024"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="whutSummary" className="block text-sm font-medium">
          WhutSummary * (your funny take)
        </label>
        <Textarea
          id="whutSummary"
          name="whutSummary"
          required
          rows={3}
          placeholder="Your blunt, funny summary of what this movie is actually about..."
        />
      </div>

      {/* Official Synopsis + TMDB fetch */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label htmlFor="description" className="block text-sm font-medium">
            Official Synopsis (optional)
          </label>
          <Button type="button" variant="outline" size="sm" onClick={fetchFromTmdb} disabled={loading}>
            {loading ? "Fetching…" : "Fetch from TMDB"}
          </Button>
        </div>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="The boring IMDb-style description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {fetchError && <p className="text-sm text-destructive">{fetchError}</p>}
      </div>

      {/* TMDB preview panel */}
      {preview && (
        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
          <p className="text-sm font-medium">
            TMDB found: <span className="text-foreground">{preview.tmdbTitle}</span>
            <span className="text-muted-foreground ml-2">#{preview.tmdbId}</span>
          </p>
          <div className="flex gap-4 flex-wrap">
            {preview.posterUrl && (
              <div className="relative w-16 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
                <Image src={preview.posterUrl} alt="TMDB poster preview" fill className="object-cover" sizes="64px" />
              </div>
            )}
            <p className="flex-1 text-sm text-muted-foreground leading-relaxed min-w-0">
              {preview.description || <em>No synopsis available</em>}
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" onClick={applyPreview}>Apply to form</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPreview(null)}>Discard</Button>
          </div>
          <p className="text-xs text-muted-foreground">Nothing is saved until you click Add Movie.</p>
        </div>
      )}

      {/* Poster preview */}
      {posterUrl && (
        <div className="flex items-center gap-3">
          <div className="relative w-10 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
            <Image src={posterUrl} alt="poster preview" fill className="object-cover" sizes="40px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{posterUrl}</p>
            <button type="button" onClick={() => setPosterUrl("")} className="text-xs text-destructive hover:underline">
              Clear poster
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">Genres</label>
        <div className="flex flex-wrap gap-3">
          {genres.map((g) => (
            <label key={g.id} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="genres" value={g.id} className="rounded" />
              <span className="text-sm">{g.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit">Add Movie</Button>
    </form>
  );
}
