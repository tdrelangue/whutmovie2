import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword } from "@/lib/auth";

/**
 * POST /api/admin/hash-password
 * Generate a bcrypt hash for a password
 * Body: { password }
 */
export async function POST(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.password || typeof body.password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const hash = await hashPassword(body.password);

    return NextResponse.json({ hash });
  } catch (error) {
    console.error("POST /api/admin/hash-password error:", error);
    return NextResponse.json(
      { error: "Failed to hash password" },
      { status: 500 }
    );
  }
}
