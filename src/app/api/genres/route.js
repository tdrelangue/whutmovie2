import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/**
 * GET /api/genres
 * Query params: page, pageSize, includeMovieCount
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = Math.min(parseInt(searchParams.get("pageSize")) || 50, 100);
    const includeMovieCount = searchParams.get("includeMovieCount") === "true";

    const [genres, total] = await Promise.all([
      prisma.genre.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
        include: includeMovieCount
          ? {
              _count: {
                select: { movies: true },
              },
            }
          : undefined,
      }),
      prisma.genre.count(),
    ]);

    return NextResponse.json({
      data: genres,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/genres error:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/genres
 * Body: { name, slug? }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const name = body.name.trim();
    const slug = body.slug?.trim() || slugify(name);

    // Validate slug uniqueness
    const existingSlug = await prisma.genre.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json(
        { error: `A genre with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    // Validate name uniqueness
    const existingName = await prisma.genre.findUnique({ where: { name } });
    if (existingName) {
      return NextResponse.json(
        { error: `A genre with name "${name}" already exists` },
        { status: 409 }
      );
    }

    // Create the genre
    const genre = await prisma.genre.create({
      data: {
        name,
        slug,
      },
    });

    return NextResponse.json({ data: genre }, { status: 201 });
  } catch (error) {
    console.error("POST /api/genres error:", error);
    return NextResponse.json(
      { error: "Failed to create genre" },
      { status: 500 }
    );
  }
}
