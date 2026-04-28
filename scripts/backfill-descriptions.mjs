/**
 * One-time script: overwrite every movie's description with the English
 * overview from TMDB. Skips movies with no tmdbId.
 *
 * Run once, then delete this file.
 *   node scripts/backfill-descriptions.mjs
 */

import { PrismaClient } from "@prisma/client";
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

const TMDB_KEY = process.env.TMDB_API_KEY;
if (!TMDB_KEY) {
  console.error("❌  TMDB_API_KEY not set.");
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const movies = await prisma.movie.findMany({
    select: { id: true, title: true, tmdbId: true },
    orderBy: { title: "asc" },
  });

  const withId = movies.filter((m) => m.tmdbId);
  console.log(`\n📝  Backfilling descriptions for ${withId.length} movie(s)...\n`);

  let updated = 0;
  let empty = 0;

  for (const movie of withId) {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.tmdbId}?language=en-US&api_key=${TMDB_KEY}`
    );
    if (!res.ok) {
      console.warn(`⚠  TMDB error for "${movie.title}" (${movie.tmdbId}): HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    const overview = data.overview?.trim() || null;

    await prisma.movie.update({
      where: { id: movie.id },
      data: { description: overview },
    });

    if (overview) {
      console.log(`✓  ${movie.title}`);
      updated++;
    } else {
      console.log(`·  ${movie.title} — no overview on TMDB`);
      empty++;
    }
  }

  console.log(`\n✅  Done. ${updated} updated, ${empty} had no overview.\n`);
  console.log("You can now delete this file.\n");
}

main()
  .catch((e) => { console.error("❌", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
