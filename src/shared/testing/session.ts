import { betterAuth } from "better-auth";
import { setTokenUtil } from "better-auth/oauth2";
import { testUtils } from "better-auth/plugins";
import { authOptions, getAuth } from "@/auth/auth";

// Same database and secret as the app's instance, plus better-auth's test helpers.
const testAuth = betterAuth({ ...authOptions(), plugins: [testUtils()] });

export const testUser = { email: "max.mustermann@example.com", name: "Max Mustermann" };

export interface SignedIn {
  userId: string;
  /** Value for a Cookie header that carries the session (API tests). */
  cookie: string;
  /** The same session as browser cookies (e2e). */
  cookies: Awaited<ReturnType<TestHelpers["getCookies"]>>;
}

type TestHelpers = Awaited<typeof testAuth.$context>["test"];

/** Creates a user with a real better-auth session in the database. */
export async function signIn(user = testUser): Promise<SignedIn> {
  const { test } = await testAuth.$context;
  const draft = test.createUser(user);
  const saved = await test.saveUser(draft);
  const { headers, cookies } = await test.login({ userId: saved.id });
  return { userId: saved.id, cookie: headers.get("cookie") ?? "", cookies };
}

/** Links a Google account to the user, storing the token encrypted as the OAuth callback does. */
export async function linkGoogleAccount(userId: string, accessToken: string): Promise<void> {
  const authContext = await getAuth().$context;
  const storedToken = await setTokenUtil(accessToken, authContext);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await authContext.internalAdapter.createAccount({
    userId,
    providerId: "google",
    accountId: "google-account-id",
    accessToken: storedToken,
    accessTokenExpiresAt: expiresAt,
  });
}
