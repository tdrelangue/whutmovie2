import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/**
 * GET /api/genres/[id]
 * Get a single genre by ID or slug
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let genre = await prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: { movies: true },
        },
      },
    });

    if (!genre) {
      genre = await prisma.genre.findUnique({
        where: { slug: id },
        include: {
          _count: {
            select: { movies: true },
          },
        },
      });
    }

    if (!genre) {
      return NextResponse.json(
        { error: "Genre not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: genre });
  } catch (error) {
    console.error("GET /api/genres/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/genres/[id]
 * Update a genre
 * Body: { name? }
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Find existing genre
    const existingGenre = await prisma.genre.findUnique({ where: { id } });
    if (!existingGenre) {
      return NextResponse.json(
        { error: "Genre not found" },
        { status: 404 }
      );
    }

    const updateData = {};

    // Update name if provided
    if (body.name !== undefined) {
      const name = body.name.trim();
      if (name === "") {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }

      // Check name uniqueness
      const existingName = await prisma.genre.findFirst({
        where: { name, id: { not: id } },
      });
      if (existingName) {
        return NextResponse.json(
          { error: `A genre with name "${name}" already exists` },
          { status: 409 }
        );
      }

      updateData.name = name;
      updateData.slug = slugify(name);
    }

    // Update genre
    const genre = await prisma.genre.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: genre });
  } catch (error) {
    console.error("PATCH /api/genres/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update genre" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/genres/[id]
 * Delete a genre
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: { movies: true },
        },
      },
    });

    if (!existingGenre) {
      return NextResponse.json(
        { error: "Genre not found" },
        { status: 404 }
      );
    }

    // Warn if genre has movies
    if (existingGenre._count.movies > 0) {
      const { searchParams } = new URL(request.url);
      const force = searchParams.get("force") === "true";

      if (!force) {
        return NextResponse.json(
          {
            error: `Genre has ${existingGenre._count.movies} associated movie(s). Add ?force=true to delete anyway.`,
            movieCount: existingGenre._count.movies,
          },
          { status: 400 }
        );
      }
    }

    // Delete genre (this will disconnect from movies, not delete movies)
    await prisma.genre.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Genre deleted" });
  } catch (error) {
    console.error("DELETE /api/genres/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete genre" },
      { status: 500 }
    );
  }
}
