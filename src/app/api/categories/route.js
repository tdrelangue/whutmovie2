import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/**
 * GET /api/categories
 * Query params: page, pageSize
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = Math.min(parseInt(searchParams.get("pageSize")) || 50, 100);
    const includeAssignments = searchParams.get("include") === "assignments";

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { title: "asc" },
        include: includeAssignments
          ? {
              assignments: {
                orderBy: { rank: "asc" },
                include: {
                  movie: {
                    select: { id: true, title: true, slug: true, year: true },
                  },
                },
              },
            }
          : undefined,
      }),
      prisma.category.count(),
    ]);

    return NextResponse.json({
      data: categories,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Body: { title, description, slug?, picks?: { movieId: string, rank: 1|2|3 }[], honorableMentions?: { movieId: string }[] }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== "string" || body.description.trim() === "") {
      return NextResponse.json(
        { error: "Description is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const title = body.title.trim();
    const description = body.description.trim();
    const slug = body.slug?.trim() || slugify(title);

    // Validate slug uniqueness
    const existingCategory = await prisma.category.findUnique({ where: { slug } });
    if (existingCategory) {
      return NextResponse.json(
        { error: `A category with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    // Validate title uniqueness
    const existingTitle = await prisma.category.findUnique({ where: { title } });
    if (existingTitle) {
      return NextResponse.json(
        { error: `A category with title "${title}" already exists` },
        { status: 409 }
      );
    }

    // Prepare category assignments (picks)
    let categoryAssignments = [];

    if (Array.isArray(body.picks) && body.picks.length > 0) {
      for (const pick of body.picks) {
        if (!pick.movieId) {
          return NextResponse.json(
            { error: "Each pick must have a movieId" },
            { status: 400 }
          );
        }

        const movie = await prisma.movie.findUnique({
          where: { id: pick.movieId },
        });
        if (!movie) {
          return NextResponse.json(
            { error: `Movie not found: ${pick.movieId}` },
            { status: 400 }
          );
        }

        const rank = pick.rank ? parseInt(pick.rank) : null;
        if (rank !== null && (rank < 1 || rank > 3)) {
          return NextResponse.json(
            { error: "Rank must be 1, 2, or 3" },
            { status: 400 }
          );
        }

        // Check for duplicate ranks
        if (rank !== null && categoryAssignments.some((a) => a.rank === rank)) {
          return NextResponse.json(
            { error: `Duplicate rank ${rank} in picks` },
            { status: 400 }
          );
        }

        categoryAssignments.push({
          movieId: pick.movieId,
          rank: rank,
          isHonorableMention: false,
        });
      }
    }

    // Add honorable mentions
    if (Array.isArray(body.honorableMentions) && body.honorableMentions.length > 0) {
      for (const mention of body.honorableMentions) {
        if (!mention.movieId) {
          return NextResponse.json(
            { error: "Each honorable mention must have a movieId" },
            { status: 400 }
          );
        }

        const movie = await prisma.movie.findUnique({
          where: { id: mention.movieId },
        });
        if (!movie) {
          return NextResponse.json(
            { error: `Movie not found: ${mention.movieId}` },
            { status: 400 }
          );
        }

        // Check if movie is already in picks
        if (categoryAssignments.some((a) => a.movieId === mention.movieId)) {
          return NextResponse.json(
            { error: `Movie ${mention.movieId} is already in picks` },
            { status: 400 }
          );
        }

        categoryAssignments.push({
          movieId: mention.movieId,
          rank: null,
          isHonorableMention: true,
        });
      }
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        title,
        slug,
        description,
        assignments: {
          create: categoryAssignments,
        },
      },
      include: {
        assignments: {
          orderBy: { rank: "asc" },
          include: {
            movie: {
              select: { id: true, title: true, slug: true, year: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
