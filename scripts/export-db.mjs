/**
 * scripts/export-db.mjs
 *
 * Exports the entire database to a JSON snapshot file.
 * Output format is identical to the import format accepted by import-json.mjs.
 *
 * Usage:
 *   node scripts/export-db.mjs
 *   node scripts/export-db.mjs --out exports/my-backup.json
 *
 * Required env vars (loaded from .env automatically):
 *   DATABASE_URL
 */

import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env
import { readFileSync } from "fs";
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = val;
  }
}

const prisma = new PrismaClient();

async function main() {
  // Resolve output path
  const outArg = process.argv.indexOf("--out");
  const today = new Date().toISOString().slice(0, 10);
  const defaultOut = `exports/backup-${today}.json`;
  const outPath = resolve(process.cwd(), outArg !== -1 ? process.argv[outArg + 1] : defaultOut);

  const outDir = outPath.substring(0, outPath.lastIndexOf("/") !== -1 ? outPath.lastIndexOf("/") : outPath.lastIndexOf("\\"));
  if (outDir && !existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  console.log("\n📦 Exporting database...\n");

  // Fetch all data
  const [movies, categories, genres] = await Promise.all([
    prisma.movie.findMany({
      include: {
        genres: { select: { slug: true } },
        streamingLinks: {
          select: { platform: true, region: true, url: true, source: true },
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.category.findMany({
      include: {
        assignments: {
          include: { movie: { select: { slug: true } } },
          orderBy: [{ rank: "asc" }, { isHonorableMention: "asc" }],
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Shape movies
  const moviesOut = movies.map((m) => ({
    title: m.title,
    slug: m.slug,
    year: m.year,
    whutSummary: m.whutSummary,
    description: m.description,
    tmdbId: m.tmdbId,
    genres: m.genres.map((g) => g.slug),
    streamingLinks: m.streamingLinks
      .filter((l) => l.source === "MANUAL")
      .map(({ platform, region, url }) => ({ platform, region, url })),
  }));

  // Shape categories
  const categoriesOut = categories.map((c) => ({
    title: c.title,
    slug: c.slug,
    description: c.description,
    picks: c.assignments
      .filter((a) => !a.isHonorableMention)
      .map((a) => ({ movieSlug: a.movie.slug, rank: a.rank })),
    honorableMentions: c.assignments
      .filter((a) => a.isHonorableMention)
      .map((a) => ({ movieSlug: a.movie.slug })),
  }));

  // Shape genres (for reference)
  const genresOut = genres.map((g) => ({ name: g.name, slug: g.slug }));

  const snapshot = {
    exportedAt: new Date().toISOString(),
    stats: {
      movies: moviesOut.length,
      categories: categoriesOut.length,
      genres: genresOut.length,
    },
    genres: genresOut,
    movies: moviesOut,
    categories: categoriesOut,
  };

  writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf8");

  console.log(`✅ Export complete:`);
  console.log(`   ${moviesOut.length} movies`);
  console.log(`   ${categoriesOut.length} categories`);
  console.log(`   ${genresOut.length} genres`);
  console.log(`   → ${outPath}\n`);
}

main()
  .catch((e) => {
    console.error("\n❌ Export failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
