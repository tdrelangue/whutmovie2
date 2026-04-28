/**
 * scripts/import-json.mjs
 *
 * Batch-import movies and categories from a JSON file.
 * The format is identical to the output of export-db.mjs.
 *
 * Usage:
 *   node scripts/import-json.mjs exports/backup-2026-04-28.json
 *   node scripts/import-json.mjs my-update.json
 *
 * Rules:
 *   - Genres: upsert by slug
 *   - Movies: upsert by slug (create if new, update if exists)
 *   - Categories: upsert by slug, then REPLACE all assignments
 *     with what is in the file (picks + honorable mentions)
 *   - Streaming links in the file are ignored (managed separately)
 *
 * Required env vars (loaded from .env automatically):
 *   DATABASE_URL
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// Load .env
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

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-json.mjs <path-to-file.json>");
  process.exit(1);
}

const absPath = resolve(process.cwd(), filePath);
if (!existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync(absPath, "utf8"));
} catch {
  console.error("Could not parse file — make sure it is valid JSON.");
  process.exit(1);
}

if (!Array.isArray(data.movies)) {
  console.error('JSON must have a "movies" array.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const stats = {
    genresUpserted: 0,
    moviesCreated: 0,
    moviesUpdated: 0,
    categoriesCreated: 0,
    categoriesUpdated: 0,
    assignmentsWritten: 0,
    errors: [],
  };

  console.log(`\n📥  Importing from ${absPath}\n`);

  // 1. Upsert genres
  const genreMap = {};
  for (const g of data.genres ?? []) {
    if (!g.slug || !g.name) continue;
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name },
      create: { name: g.name, slug: g.slug },
    });
    genreMap[g.slug] = genre.id;
    stats.genresUpserted++;
  }
  const existing = await prisma.genre.findMany({ select: { id: true, slug: true } });
  for (const g of existing) if (!genreMap[g.slug]) genreMap[g.slug] = g.id;

  console.log(`   ✓ Genres: ${stats.genresUpserted} upserted`);

  // 2. Upsert movies
  const movieMap = {};
  for (const m of data.movies) {
    if (!m.slug || !m.title || !m.whutSummary) {
      stats.errors.push(`Skipped movie "${m.title ?? "(no title)"}" — missing slug or whutSummary.`);
      continue;
    }

    const genreConnections = (m.genres ?? [])
      .map((s) => genreMap[s])
      .filter(Boolean)
      .map((id) => ({ id }));

    try {
      const prev = await prisma.movie.findUnique({ where: { slug: m.slug } });
      const movie = await prisma.movie.upsert({
        where: { slug: m.slug },
        update: {
          title: m.title,
          whutSummary: m.whutSummary,
          description: m.description ?? null,
          year: m.year ?? null,
          tmdbId: m.tmdbId ?? null,
          genres: { set: genreConnections },
        },
        create: {
          title: m.title,
          slug: m.slug,
          whutSummary: m.whutSummary,
          description: m.description ?? null,
          year: m.year ?? null,
          tmdbId: m.tmdbId ?? null,
          genres: { connect: genreConnections },
        },
      });
      movieMap[m.slug] = movie.id;
      if (prev) stats.moviesUpdated++;
      else { stats.moviesCreated++; console.log(`   + Movie: ${movie.title}`); }
    } catch (e) {
      stats.errors.push(`Movie "${m.title}": ${e.message}`);
    }
  }

  console.log(`   ✓ Movies: ${stats.moviesCreated} created, ${stats.moviesUpdated} updated`);

  // 3. Upsert categories + replace assignments
  for (const c of data.categories ?? []) {
    if (!c.slug || !c.title || !c.description) {
      stats.errors.push(`Skipped category "${c.title ?? "(no title)"}" — missing required fields.`);
      continue;
    }

    try {
      const prev = await prisma.category.findUnique({ where: { slug: c.slug } });
      const category = await prisma.category.upsert({
        where: { slug: c.slug },
        update: { title: c.title, description: c.description },
        create: { title: c.title, slug: c.slug, description: c.description },
      });

      if (prev) stats.categoriesUpdated++;
      else { stats.categoriesCreated++; console.log(`   + Category: ${category.title}`); }

      await prisma.categoryAssignment.deleteMany({ where: { categoryId: category.id } });

      for (const pick of c.picks ?? []) {
        const movieId = movieMap[pick.movieSlug];
        if (!movieId) { stats.errors.push(`"${c.title}" pick: slug "${pick.movieSlug}" not found.`); continue; }
        await prisma.categoryAssignment.create({
          data: { categoryId: category.id, movieId, rank: pick.rank },
        });
        stats.assignmentsWritten++;
      }

      for (const hm of c.honorableMentions ?? []) {
        const movieId = movieMap[hm.movieSlug];
        if (!movieId) { stats.errors.push(`"${c.title}" HM: slug "${hm.movieSlug}" not found.`); continue; }
        await prisma.categoryAssignment.create({
          data: { categoryId: category.id, movieId, rank: null, isHonorableMention: true },
        });
        stats.assignmentsWritten++;
      }
    } catch (e) {
      stats.errors.push(`Category "${c.title}": ${e.message}`);
    }
  }

  console.log(`   ✓ Categories: ${stats.categoriesCreated} created, ${stats.categoriesUpdated} updated`);
  console.log(`   ✓ Assignments: ${stats.assignmentsWritten} written`);

  if (stats.errors.length > 0) {
    console.warn(`\n⚠  ${stats.errors.length} warning(s):`);
    for (const e of stats.errors) console.warn(`   · ${e}`);
  }

  console.log(`\n✅  Done.\n`);
}

main()
  .catch((e) => {
    console.error("\n❌  Import failed:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
