import { createHash } from "node:crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import { sessionSecret } from "@/environment";
import { RequestUser } from "@/shared/orpc/context";

export const SESSION_COOKIE = "mosaik_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

// The cookie carries the Google refresh token, so it is encrypted (JWE), not just signed.
function encryptionKey(): Uint8Array {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const digest = createHash("sha256").update(secret).digest();
  return new Uint8Array(digest);
}

/** Short-lived cookie that carries the OAuth state (CSRF check) and where to go afterwards. */
export const OAUTH_STATE_COOKIE = "mosaik_oauth";
export const OAUTH_STATE_MAX_AGE_SECONDS = 10 * 60;

export interface OAuthState {
  state: string;
  returnTo: string;
}

function encrypt(payload: Record<string, string>, maxAgeSeconds: number): Promise<string> {
  const jwt = new EncryptJWT(payload);
  jwt.setProtectedHeader({ alg: "dir", enc: "A256GCM" });
  jwt.setIssuedAt();
  jwt.setExpirationTime(`${maxAgeSeconds}s`);
  return jwt.encrypt(encryptionKey());
}

async function decrypt(token: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtDecrypt(token, encryptionKey());
    return payload;
  } catch {
    return null;
  }
}

export function encodeSession(user: RequestUser): Promise<string> {
  return encrypt({ ...user }, SESSION_MAX_AGE_SECONDS);
}

/** Returns the user for a valid, unexpired token and null for anything else. */
export async function decodeSession(token: string): Promise<RequestUser | null> {
  const payload = await decrypt(token);
  if (!payload) return null;

  const { email, name, provider, refreshToken } = payload;
  if (typeof email !== "string" || typeof refreshToken !== "string") return null;
  if (provider !== "google" && provider !== "test_provider") return null;
  return { email, name: typeof name === "string" ? name : "", provider, refreshToken };
}

export function encodeOAuthState(oauthState: OAuthState): Promise<string> {
  return encrypt({ ...oauthState }, OAUTH_STATE_MAX_AGE_SECONDS);
}

export async function decodeOAuthState(token: string): Promise<OAuthState | null> {
  const payload = await decrypt(token);
  if (!payload) return null;

  const { state, returnTo } = payload;
  if (typeof state !== "string" || typeof returnTo !== "string") return null;
  return { state, returnTo };
}

/** Only same-site paths are allowed as a post-login target, so the flow can't redirect off-site. */
export function safeReturnTo(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return value;
}
