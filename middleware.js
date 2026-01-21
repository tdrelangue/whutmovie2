import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "whutmovie_session";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // We can't use Prisma in edge middleware, so we'll validate the session
    // in the actual page/API route. The cookie presence is a first-line check.
    // For additional security, each admin page will also verify the session.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
