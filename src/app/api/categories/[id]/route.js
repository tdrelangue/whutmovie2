import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slugify";

/**
 * GET /api/categories/[id]
 * Get a single category by ID or slug
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Try to find by ID first, then by slug
    let category = await prisma.category.findUnique({
      where: { id },
      include: {
        assignments: {
          orderBy: { rank: "asc" },
          include: {
            movie: {
              select: { id: true, title: true, slug: true, year: true, whutSummary: true },
            },
          },
        },
      },
    });

    if (!category) {
      category = await prisma.category.findUnique({
        where: { slug: id },
        include: {
          assignments: {
            orderBy: { rank: "asc" },
            include: {
              movie: {
                select: { id: true, title: true, slug: true, year: true, whutSummary: true },
              },
            },
          },
        },
      });
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/categories/[id]
 * Update a category
 * Body: { title?, description?, picks?, honorableMentions? }
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Find existing category
    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const updateData = {};

    // Update title if provided
    if (body.title !== undefined) {
      const title = body.title.trim();
      if (title === "") {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }

      // Check title uniqueness
      const existingTitle = await prisma.category.findFirst({
        where: { title, id: { not: id } },
      });
      if (existingTitle) {
        return NextResponse.json(
          { error: `A category with title "${title}" already exists` },
          { status: 409 }
        );
      }

      updateData.title = title;
      updateData.slug = slugify(title);
    }

    // Update description if provided
    if (body.description !== undefined) {
      const description = body.description.trim();
      if (description === "") {
        return NextResponse.json(
          { error: "Description cannot be empty" },
          { status: 400 }
        );
      }
      updateData.description = description;
    }

    // Update category
    const category = await prisma.category.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ data: category });
  } catch (error) {
    console.error("PATCH /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Delete category (assignments will be cascade deleted)
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
