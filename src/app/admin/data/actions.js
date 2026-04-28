"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function importData(prevState, formData) {
  const file = formData.get("file");

  if (!file || !file.size) {
    return { error: "No file provided." };
  }

  let data;
  try {
    const text = await file.text();
    data = JSON.parse(text);
  } catch {
    return { error: "Could not parse the file. Make sure it is valid JSON." };
  }

  if (!Array.isArray(data.movies)) {
    return { error: 'JSON must have a "movies" array. Use the export button to get a valid format.' };
  }

  const stats = {
    genresUpserted: 0,
    moviesCreated: 0,
    moviesUpdated: 0,
    categoriesCreated: 0,
    categoriesUpdated: 0,
    assignmentsWritten: 0,
    errors: [],
  };

  // 1. Upsert genres from the file
  const genreMap = {}; // slug → id
  for (const g of data.genres ?? []) {
    if (!g.slug || !g.name) continue;
    try {
      const genre = await prisma.genre.upsert({
        where: { slug: g.slug },
        update: { name: g.name },
        create: { name: g.name, slug: g.slug },
      });
      genreMap[g.slug] = genre.id;
      stats.genresUpserted++;
    } catch (e) {
      stats.errors.push(`Genre "${g.name}": ${e.message}`);
    }
  }

  // Merge with genres already in DB (movies might reference slugs not in the file)
  const existingGenres = await prisma.genre.findMany({
    select: { id: true, slug: true },
  });
  for (const g of existingGenres) {
    if (!genreMap[g.slug]) genreMap[g.slug] = g.id;
  }

  // 2. Upsert movies
  const movieMap = {}; // slug → id
  for (const m of data.movies) {
    if (!m.slug || !m.title || !m.whutSummary) {
      stats.errors.push(
        `Skipped movie "${m.title ?? "(no title)"}" — missing slug or whutSummary.`
      );
      continue;
    }

    const genreConnections = (m.genres ?? [])
      .map((s) => genreMap[s])
      .filter(Boolean)
      .map((id) => ({ id }));

    try {
      const existing = await prisma.movie.findUnique({ where: { slug: m.slug } });

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
      if (existing) stats.moviesUpdated++;
      else stats.moviesCreated++;
    } catch (e) {
      stats.errors.push(`Movie "${m.title}": ${e.message}`);
    }
  }

  // 3. Upsert categories + replace their assignments
  for (const c of data.categories ?? []) {
    if (!c.slug || !c.title || !c.description) {
      stats.errors.push(
        `Skipped category "${c.title ?? "(no title)"}" — missing slug or description.`
      );
      continue;
    }

    let category;
    try {
      const existing = await prisma.category.findUnique({ where: { slug: c.slug } });

      category = await prisma.category.upsert({
        where: { slug: c.slug },
        update: { title: c.title, description: c.description },
        create: { title: c.title, slug: c.slug, description: c.description },
      });

      if (existing) stats.categoriesUpdated++;
      else stats.categoriesCreated++;
    } catch (e) {
      stats.errors.push(`Category "${c.title}": ${e.message}`);
      continue;
    }

    // Replace all assignments for this category with what's in the JSON
    await prisma.categoryAssignment.deleteMany({
      where: { categoryId: category.id },
    });

    for (const pick of c.picks ?? []) {
      const movieId = movieMap[pick.movieSlug];
      if (!movieId) {
        stats.errors.push(
          `Category "${c.title}" pick — movie slug "${pick.movieSlug}" not found.`
        );
        continue;
      }
      await prisma.categoryAssignment.create({
        data: { categoryId: category.id, movieId, rank: pick.rank },
      });
      stats.assignmentsWritten++;
    }

    for (const hm of c.honorableMentions ?? []) {
      const movieId = movieMap[hm.movieSlug];
      if (!movieId) {
        stats.errors.push(
          `Category "${c.title}" HM — movie slug "${hm.movieSlug}" not found.`
        );
        continue;
      }
      await prisma.categoryAssignment.create({
        data: {
          categoryId: category.id,
          movieId,
          rank: null,
          isHonorableMention: true,
        },
      });
      stats.assignmentsWritten++;
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/movies");
  revalidatePath("/admin/categories");
  revalidatePath("/movies");
  revalidatePath("/categories");
  revalidatePath("/");

  return { success: true, stats };
}
