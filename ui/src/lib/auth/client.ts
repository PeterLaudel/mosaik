import { createAuthClient } from "better-auth/react";

/**
 * better-auth's client. It talks to /api/auth on the current origin, which Next forwards to the
 * API, so the session cookie is first-party.
 */
export const authClient = createAuthClient();

/**
 * Starts Google sign-in and comes back to `returnTo` (a path on this site) afterwards.
 * better-auth's client returns errors instead of throwing; this throws so callers can show them.
 */
export async function signInWithGoogle(returnTo: string): Promise<void> {
  const callbackURL = new URL(returnTo, window.location.origin).toString();
  const { error } = await authClient.signIn.social({ provider: "google", callbackURL });
  if (error) throw new Error(error.message ?? "Google sign-in failed");
}
