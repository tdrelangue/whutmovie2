/**
 * scripts/sync-streaming.mjs
 *
 * Fetches streaming availability AND poster images from TMDB for every movie
 * in the database.
 *
 * What it syncs per movie:
 *   - posterUrl  — stored directly on Movie (https://image.tmdb.org/t/p/w500/...)
 *   - StreamingLink rows (source = "TMDB") for FR and BE flatrate providers
 *
 * Manually-added streaming links (source = "MANUAL") are never touched.
 * Uses append_to_response to fetch poster + providers in a single API call.
 *
 * Usage:
 *   node scripts/sync-streaming.mjs
 *
 * Required env vars (put them in .env or pass inline):
 *   TMDB_API_KEY   — free key from https://www.themoviedb.org/settings/api
 *   DATABASE_URL   — already in your .env
 *
 * Regions synced: FR (France) and BE (Belgium).
 * Only "flatrate" (subscription) providers are imported — not "buy" or "rent".
 * The URL stored per link is the JustWatch country page for that movie.
 */

import { PrismaClient } from "@prisma/client";
import { getPlatformByTmdbId } from "../src/lib/streaming-platforms.js";

// ---------------------------------------------------------------------------
// Load .env manually (no dotenv installed — use Node's built-in if available)
// ---------------------------------------------------------------------------
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const TMDB_KEY = process.env.TMDB_API_KEY;
if (!TMDB_KEY) {
  console.error("❌  TMDB_API_KEY is not set. Add it to .env or pass it inline.");
  process.exit(1);
}

const REGIONS = ["FR", "BE", "US", "GB", "CA", "AU", "DE", "ES"];
const TMDB_BASE = "https://api.themoviedb.org/3";

// ---------------------------------------------------------------------------
// TMDB helper
// ---------------------------------------------------------------------------
async function tmdb(path) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${TMDB_BASE}${path}${sep}api_key=${TMDB_KEY}`);
  if (!res.ok) {
    throw new Error(`TMDB ${path} → HTTP ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const prisma = new PrismaClient();

async function main() {
  const movies = await prisma.movie.findMany({
    select: { id: true, title: true, year: true, tmdbId: true },
    orderBy: { title: "asc" },
  });

  console.log(`\n📽  Syncing ${movies.length} movie(s)...\n`);

  let synced = 0;
  let skipped = 0;

  for (const movie of movies) {
    // 1. Resolve TMDB ID
    let tmdbId = movie.tmdbId;

    if (!tmdbId) {
      const query = encodeURIComponent(movie.title);
      const yearParam = movie.year ? `&year=${movie.year}` : "";
      const searchData = await tmdb(`/search/movie?query=${query}${yearParam}&language=fr-FR`);
      const firstResult = searchData.results?.[0];

      if (!firstResult) {
        console.warn(`⚠  No TMDB match: "${movie.title}" — set tmdbId manually in admin`);
        skipped++;
        continue;
      }

      tmdbId = firstResult.id;
      await prisma.movie.update({ where: { id: movie.id }, data: { tmdbId } });
      console.log(`   🔍 Matched "${movie.title}" → TMDB #${tmdbId} (${firstResult.title}, ${firstResult.release_date?.slice(0, 4) ?? "?"})`);
    }

    // 2. Fetch movie details + watch providers in one call (append_to_response)
    const movieData = await tmdb(
      `/movie/${tmdbId}?append_to_response=watch%2Fproviders&language=fr-FR`
    );
    const results = movieData["watch/providers"]?.results ?? {};

    // 3. Store poster URL and official synopsis (only if not already set manually)
    const posterPath = movieData.poster_path;
    const posterUrl = posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : null;
    const overview = movieData.overview || null;

    const movieRecord = await prisma.movie.findUnique({
      where: { id: movie.id },
      select: { description: true },
    });
    const updateData = {};
    if (posterUrl) updateData.posterUrl = posterUrl;
    if (overview && !movieRecord.description) updateData.description = overview;

    if (Object.keys(updateData).length > 0) {
      await prisma.movie.update({ where: { id: movie.id }, data: updateData });
    }

    // 4. Build new TMDB-sourced streaming links
    const newLinks = [];
    for (const region of REGIONS) {
      const countryData = results[region];
      if (!countryData) continue;

      const jwUrl = countryData.link; // JustWatch page for this movie in this country
      const flatrate = countryData.flatrate ?? [];

      for (const provider of flatrate) {
        const platform = getPlatformByTmdbId(provider.provider_id);
        if (!platform) continue; // provider not in our list — silently skip
        newLinks.push({
          movieId: movie.id,
          platform: platform.id,
          region,
          url: jwUrl,
          source: "TMDB",
        });
      }
    }

    // 5. Replace old TMDB links with fresh ones (manual links untouched)
    await prisma.$transaction([
      prisma.streamingLink.deleteMany({ where: { movieId: movie.id, source: "TMDB" } }),
      ...(newLinks.length > 0 ? [prisma.streamingLink.createMany({ data: newLinks })] : []),
    ]);

    const posterMark = posterUrl ? "🖼" : "·";
    const streamingSummary = newLinks.length > 0
      ? newLinks.map((l) => `${l.platform} (${l.region})`).join(", ")
      : "no subscription providers found";

    console.log(`${posterMark} ✓  ${movie.title} — ${streamingSummary}`);
    synced++;
  }

  console.log(`\n✅  Done. ${synced} synced, ${skipped} skipped.\n`);
}

main()
  .catch((e) => {
    console.error("\n❌  Sync failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
