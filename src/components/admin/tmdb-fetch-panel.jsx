"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TmdbFetchPanel({
  movieTitle,
  movieYear,
  initialTmdbId,
  initialDescription,
  initialPosterUrl,
}) {
  const [description, setDescription] = useState(initialDescription || "");
  const [posterUrl, setPosterUrl] = useState(initialPosterUrl || "");
  const [tmdbId, setTmdbId] = useState(initialTmdbId || "");
  const [preview, setPreview] = useState(null); // { tmdbId, posterUrl, description, tmdbTitle }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchFromTmdb() {
    setLoading(true);
    setError(null);
    setPreview(null);

    const params = new URLSearchParams();
    if (tmdbId) {
      params.set("tmdbId", tmdbId);
    } else {
      params.set("title", movieTitle);
      if (movieYear) params.set("year", movieYear);
    }

    try {
      const res = await fetch(`/api/admin/tmdb-fetch?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Fetch failed");
        return;
      }
      setPreview(data);
    } catch {
      setError("Network error — check your connection");
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

  function discardPreview() {
    setPreview(null);
    setError(null);
  }

  return (
    <>
      {/* Hidden inputs so the form picks up poster + tmdbId overrides */}
      <input type="hidden" name="posterUrl" value={posterUrl} />
      <input type="hidden" name="tmdbId" value={tmdbId} />

      {/* Official Synopsis field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label htmlFor="description" className="block text-sm font-medium">
            Official Synopsis (optional)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchFromTmdb}
            disabled={loading}
          >
            {loading ? "Fetching…" : "Fetch from TMDB"}
          </Button>
        </div>

        <Textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="The boring IMDb-style description (optional)"
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>

      {/* Preview panel */}
      {preview && (
        <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
          <p className="text-sm font-medium">
            TMDB found: <span className="text-foreground">{preview.tmdbTitle}</span>
            <span className="text-muted-foreground ml-2">#{preview.tmdbId}</span>
          </p>

          <div className="flex gap-4 flex-wrap">
            {preview.posterUrl && (
              <div className="relative w-20 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
                <Image
                  src={preview.posterUrl}
                  alt="TMDB poster preview"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {preview.description || <em>No synopsis available</em>}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" onClick={applyPreview}>
              Apply to form
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={discardPreview}>
              Discard
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Nothing is saved until you click Save Changes below.
          </p>
        </div>
      )}

      {/* Poster preview (if one is set in the form) */}
      {posterUrl && (
        <div className="flex items-center gap-3">
          <div className="relative w-12 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
            <Image
              src={posterUrl}
              alt="Current poster"
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{posterUrl}</p>
            <button
              type="button"
              onClick={() => setPosterUrl("")}
              className="text-xs text-destructive hover:underline mt-0.5"
            >
              Clear poster
            </button>
          </div>
        </div>
      )}
    </>
  );
}
