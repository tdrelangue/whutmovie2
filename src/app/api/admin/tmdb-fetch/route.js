import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = process.env.TMDB_API_KEY;
  if (!key) return NextResponse.json({ error: "TMDB_API_KEY not configured" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  let tmdbId = searchParams.get("tmdbId");
  const title = searchParams.get("title");
  const year = searchParams.get("year");

  if (!tmdbId) {
    if (!title) return NextResponse.json({ error: "Provide tmdbId or title" }, { status: 400 });
    const q = encodeURIComponent(title);
    const yearParam = year ? `&year=${year}` : "";
    const res = await fetch(
      `${TMDB_BASE}/search/movie?query=${q}${yearParam}&language=fr-FR&api_key=${key}`
    );
    const data = await res.json();
    const first = data.results?.[0];
    if (!first) return NextResponse.json({ error: "No TMDB match found" }, { status: 404 });
    tmdbId = first.id;
  }

  const res = await fetch(`${TMDB_BASE}/movie/${tmdbId}?language=fr-FR&api_key=${key}`);
  if (!res.ok) return NextResponse.json({ error: "TMDB request failed" }, { status: 502 });
  const data = await res.json();

  return NextResponse.json({
    tmdbId: data.id,
    posterUrl: data.poster_path
      ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
      : null,
    description: data.overview || null,
    tmdbTitle: data.title,
  });
}
