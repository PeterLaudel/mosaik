import { createHash } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";

export const SESSION_COOKIE = "mosaik.session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export interface Session {
  /** "google" in production, "test_provider" in e2e (mails go to a JSON transport). */
  provider: "google" | "test_provider";
  name: string;
  email: string;
  picture: string | null;
  /** Google refresh token with the https://mail.google.com/ scope, used to send invoices. */
  refreshToken: string | null;
}

// The cookie carries a Gmail refresh token, so it is encrypted (JWE), not just signed
function key(secret: string): Uint8Array {
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHash("sha256").update(secret).digest();
}

export async function encodeSession(session: Session, secret: string): Promise<string> {
  return new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .encrypt(key(secret));
}

export async function decodeSession(token: string, secret: string): Promise<Session | null> {
  try {
    const { payload } = await jwtDecrypt(token, key(secret));
    const text = (value: unknown) => (typeof value === "string" ? value : "");
    return {
      provider: payload.provider as Session["provider"],
      name: text(payload.name),
      email: text(payload.email),
      picture: typeof payload.picture === "string" ? payload.picture : null,
      refreshToken: typeof payload.refreshToken === "string" ? payload.refreshToken : null,
    };
  } catch {
    return null;
  }
}
