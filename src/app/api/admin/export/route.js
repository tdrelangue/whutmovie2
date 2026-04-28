import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const snapshot = {
    exportedAt: new Date().toISOString(),
    stats: {
      movies: moviesOut.length,
      categories: categoriesOut.length,
      genres: genres.length,
    },
    genres: genres.map((g) => ({ name: g.name, slug: g.slug })),
    movies: moviesOut,
    categories: categoriesOut,
  };

  const date = new Date().toISOString().slice(0, 10);
  const filename = `whutmovie-export-${date}.json`;

  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
