import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

const DEFAULT_PAGE_SIZE = 12;

/**
 * GET /api/movies
 * Query params: page, pageSize, genre, category, sort
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const pageSize = Math.min(parseInt(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE, 100);
    const genre = searchParams.get("genre");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "year";

    const where = {};

    if (genre) {
      where.genres = {
        some: {
          slug: genre,
        },
      };
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    const orderBy = sort === "title"
      ? { title: "asc" }
      : { year: "desc" };

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy,
        include: {
          genres: {
            select: { id: true, name: true, slug: true },
          },
          categories: {
            include: {
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      }),
      prisma.movie.count({ where }),
    ]);

    return NextResponse.json({
      data: movies,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("GET /api/movies error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/movies
 * Body: { title, slug?, description?, year?, genreSlugs?: string[], picks?: { categorySlug: string, rank?: 1|2|3, honorable?: boolean }[] }
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

    const title = body.title.trim();
    const slug = body.slug?.trim() || slugify(title);
    const description = body.description?.trim() || null;
    const year = body.year ? parseInt(body.year) : null;

    // Validate slug uniqueness
    const existingMovie = await prisma.movie.findUnique({ where: { slug } });
    if (existingMovie) {
      return NextResponse.json(
        { error: `A movie with slug "${slug}" already exists` },
        { status: 409 }
      );
    }

    // Validate year if provided
    if (year !== null && (isNaN(year) || year < 1800 || year > 2100)) {
      return NextResponse.json(
        { error: "Year must be a valid number between 1800 and 2100" },
        { status: 400 }
      );
    }

    // Prepare genres connection
    let genreConnect = [];
    if (Array.isArray(body.genreSlugs) && body.genreSlugs.length > 0) {
      const genres = await prisma.genre.findMany({
        where: { slug: { in: body.genreSlugs } },
      });
      if (genres.length !== body.genreSlugs.length) {
        const foundSlugs = genres.map((g) => g.slug);
        const missing = body.genreSlugs.filter((s) => !foundSlugs.includes(s));
        return NextResponse.json(
          { error: `Genre(s) not found: ${missing.join(", ")}` },
          { status: 400 }
        );
      }
      genreConnect = genres.map((g) => ({ id: g.id }));
    }

    // Prepare category assignments
    let categoryAssignments = [];
    if (Array.isArray(body.picks) && body.picks.length > 0) {
      for (const pick of body.picks) {
        if (!pick.categorySlug) {
          return NextResponse.json(
            { error: "Each pick must have a categorySlug" },
            { status: 400 }
          );
        }

        const category = await prisma.category.findUnique({
          where: { slug: pick.categorySlug },
        });
        if (!category) {
          return NextResponse.json(
            { error: `Category not found: ${pick.categorySlug}` },
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

        // Check if rank is already taken for this category
        if (rank !== null) {
          const existingRank = await prisma.categoryAssignment.findFirst({
            where: {
              categoryId: category.id,
              rank: rank,
            },
          });
          if (existingRank) {
            return NextResponse.json(
              { error: `Rank ${rank} is already taken in category "${category.name}"` },
              { status: 409 }
            );
          }
        }

        categoryAssignments.push({
          categoryId: category.id,
          rank: rank,
          isHonorableMention: !!pick.honorable,
        });
      }
    }

    // Create the movie
    const movie = await prisma.movie.create({
      data: {
        title,
        slug,
        description,
        year,
        genres: {
          connect: genreConnect,
        },
        categories: {
          create: categoryAssignments,
        },
      },
      include: {
        genres: {
          select: { id: true, name: true, slug: true },
        },
        categories: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: movie }, { status: 201 });
  } catch (error) {
    console.error("POST /api/movies error:", error);
    return NextResponse.json(
      { error: "Failed to create movie" },
      { status: 500 }
    );
  }
}
