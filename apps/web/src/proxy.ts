import { NextRequest, NextResponse } from "next/server";

const isDevMode = process.env.NODE_ENV !== "production";
const apiUrl = process.env.API_URL || "http://localhost:3001";

// The API owns sign-in, so ask it whether the session cookie is valid
async function isSignedIn(req: NextRequest): Promise<boolean> {
  const response = await fetch(`${apiUrl}/api/auth/me`, {
    headers: { cookie: req.headers.get("cookie") ?? "" },
    cache: "no-store",
  });
  return response.ok;
}

async function authProxy(req: NextRequest) {
  if (await isSignedIn(req)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const signinUrl = new URL("/api/auth/signin", req.url);
  signinUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(signinUrl);
}

export default function proxy(req: NextRequest) {
  return isDevMode ? NextResponse.next() : authProxy(req);
}

export const config = {
  // /api/auth and /api/health are public; everything else under /api is checked again by the API's guard
  matcher: ["/administration/:path*", "/api/((?!auth/|health).*)"],
};
