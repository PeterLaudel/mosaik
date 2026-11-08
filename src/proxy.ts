import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const SIGN_IN_PATH = "/administration/sign-in";
const isDevMode = process.env.NODE_ENV !== "production";

/**
 * Sends visitors without a session cookie to the sign-in page. This is only the redirect: the
 * API validates the session itself on every call, so a forged cookie gets no data.
 */
export default function proxy(request: NextRequest) {
  if (isDevMode || request.nextUrl.pathname === SIGN_IN_PATH) return NextResponse.next();
  if (getSessionCookie(request)) return NextResponse.next();

  const signInUrl = new URL(SIGN_IN_PATH, request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  signInUrl.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ["/administration/:path*"],
};
