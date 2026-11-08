import { headers } from "next/headers";
import { createApi, type Api } from "./client";

/** Where server components and actions reach the API directly (not through the rewrite). */
function apiUrl(): string {
  return process.env.API_URL || "http://localhost:4000";
}

/**
 * Client for server components and server actions. It forwards the incoming request's cookies,
 * so the API sees the same signed-in user as the browser.
 */
export async function serverApi(): Promise<Api> {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get("cookie") ?? undefined;
  return createApi({ origin: apiUrl(), cookie });
}
