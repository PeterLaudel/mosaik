import { betterAuth, type BetterAuthOptions } from "better-auth";
import {
  apiPublicUrl,
  authSecret,
  databaseDialect,
  googleClientId,
  googleClientSecret,
  uiUrl,
} from "@/environment";
import { getDb } from "@/initialize";

/** Nest injection token for the better-auth instance. */
export const AUTH = Symbol("AUTH");

/** better-auth serves its own routes (sign-in, callback, sign-out, session) under this path. */
export const AUTH_BASE_PATH = "/api/auth";

export function authOptions(): BetterAuthOptions {
  const type = databaseDialect() === "postgres" ? "postgres" : "sqlite";

  return {
    baseURL: apiPublicUrl(),
    basePath: AUTH_BASE_PATH,
    secret: authSecret(),
    database: { db: getDb(), type },
    // Prefixed so they don't read like the clinical "sessions" table; see migration 0020
    user: { modelName: "auth_users" },
    session: { modelName: "auth_sessions" },
    account: {
      modelName: "auth_accounts",
      // The Google tokens can send mail as the therapeut, so they are not stored in plain text
      encryptOAuthTokens: true,
    },
    verification: { modelName: "auth_verifications" },
    socialProviders: {
      google: {
        clientId: googleClientId(),
        clientSecret: googleClientSecret(),
        // Offline access + consent so Google returns a refresh token; Gmail needs mail.google.com
        accessType: "offline",
        prompt: "consent",
        scope: ["https://mail.google.com/"],
      },
    },
    trustedOrigins: [uiUrl()],
    // better-auth skips origin/redirect checks when NODE_ENV=test unless this is set explicitly;
    // pinning it keeps tests on the same protection as production
    advanced: { disableOriginCheck: false },
    telemetry: { enabled: false },
  };
}

function createAuth() {
  const options = authOptions();
  return betterAuth(options);
}

export type Auth = ReturnType<typeof createAuth>;

let instance: Auth | null = null;

export function getAuth(): Auth {
  if (instance) return instance;
  instance = createAuth();
  return instance;
}
