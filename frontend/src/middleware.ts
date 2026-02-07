import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // If user is directly opening /browse (typed URL, bookmark, or new tab), send them to home instead
  if (pathname === "/browse") {
    const referer = request.headers.get("referer");
    const origin = request.nextUrl.origin;
    const isFromSameSite = referer && referer.startsWith(origin);
    if (!isFromSameSite) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/browse",
};
