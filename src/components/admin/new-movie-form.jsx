"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMPTY_FIELDS = {
  title: "",
  year: "",
  whutSummary: "",
  description: "",
  posterUrl: "",
  tmdbId: "",
};

export function NewMovieForm({ createAction, genres }) {
  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [checkedGenres, setCheckedGenres] = useState({});
  const [preview, setPreview] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function setField(key) {
    return (e) => {
      setFields((f) => ({ ...f, [key]: e.target.value }));
      if (success) setSuccess(false);
    };
  }

  function resetForm() {
    setFields(EMPTY_FIELDS);
    setCheckedGenres({});
    setPreview(null);
    setFetchError(null);
  }

  async function fetchFromTmdb() {
    if (!fields.title.trim()) {
      setFetchError("Enter a title first");
      return;
    }
    setFetchError(null);
    setPreview(null);
    const params = new URLSearchParams();
    if (fields.tmdbId) {
      params.set("tmdbId", fields.tmdbId);
    } else {
      params.set("title", fields.title.trim());
      if (fields.year) params.set("year", fields.year);
    }
    try {
      const res = await fetch(`/api/admin/tmdb-fetch?${params}`);
      const data = await res.json();
      if (!res.ok) { setFetchError(data.error || "Fetch failed"); return; }
      setPreview(data);
    } catch {
      setFetchError("Network error");
    }
  }

  function applyPreview() {
    if (!preview) return;
    setFields((f) => ({
      ...f,
      description: preview.description || f.description,
      posterUrl: preview.posterUrl || f.posterUrl,
      tmdbId: preview.tmdbId ? String(preview.tmdbId) : f.tmdbId,
    }));
    setPreview(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    startTransition(async () => {
      await createAction(formData);
      resetForm();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="posterUrl" value={fields.posterUrl} />

      {success && (
        <div className="rounded-md bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-400">
          ✓ Movie added successfully!
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">Title *</label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Movie title"
            value={fields.title}
            onChange={setField("title")}
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
            value={fields.year}
            onChange={setField("year")}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="tmdbId" className="block text-sm font-medium">
            TMDB ID <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="tmdbId"
            name="tmdbId"
            type="number"
            placeholder="e.g. 496243"
            value={fields.tmdbId}
            onChange={setField("tmdbId")}
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
          value={fields.whutSummary}
          onChange={setField("whutSummary")}
        />
      </div>

      {/* Official Synopsis + TMDB fetch */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label htmlFor="description" className="block text-sm font-medium">
            Official Synopsis (optional)
          </label>
          <Button type="button" variant="outline" size="sm" onClick={fetchFromTmdb} disabled={isPending}>
            Fetch from TMDB
          </Button>
        </div>
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder="The boring IMDb-style description (optional)"
          value={fields.description}
          onChange={setField("description")}
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
      {fields.posterUrl && (
        <div className="flex items-center gap-3">
          <div className="relative w-10 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
            <Image src={fields.posterUrl} alt="poster preview" fill className="object-cover" sizes="40px" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{fields.posterUrl}</p>
            <button
              type="button"
              onClick={() => setFields((f) => ({ ...f, posterUrl: "" }))}
              className="text-xs text-destructive hover:underline"
            >
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
              <input
                type="checkbox"
                name="genres"
                value={g.id}
                checked={!!checkedGenres[g.id]}
                onChange={(e) =>
                  setCheckedGenres((prev) => ({ ...prev, [g.id]: e.target.checked }))
                }
                className="rounded"
              />
              <span className="text-sm">{g.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add Movie"}
      </Button>
    </form>
  );
}
