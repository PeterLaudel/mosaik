import * as dotenv from "dotenv";

dotenv.config({ path: [`.env.${process.env.NODE_ENV}`], quiet: true });
dotenv.config({ path: [`.env.${process.env.NODE_ENV}.local`], override: true, quiet: true });

export function sqliteUrl(): string {
  return process.env.SQLITE_URL || "";
}

export function environment(): string {
  return process.env.NODE_ENV || "";
}

export function isProduction(): boolean {
  return environment() === "production";
}

export function isDevelopment(): boolean {
  return environment() === "development";
}

export function pdfOwnerPassword(): string {
  return process.env.PDF_OWNER_PASSWORD || ''
}

export function databaseDialect(): string {
  return process.env.DATABASE_DIALECT || ''
}

export function postgresUrl(): string {
  return process.env.POSTGRES_URL || ''
}

export function ollamaUrl(): string {
  return process.env.OLLAMA_URL || "http://localhost:11434";
}

export function ollamaModel(): string {
  return process.env.OLLAMA_MODEL || "mistral";
}

/** better-auth signs session cookies and encrypts stored OAuth tokens with this. */
export function authSecret(): string {
  return process.env.AUTH_SECRET || "";
}

/** Auth is enforced in production only, matching the Next app's previous middleware. */
export function authRequired(): boolean {
  if (process.env.AUTH_REQUIRED !== undefined) return process.env.AUTH_REQUIRED === "true";
  return isProduction();
}

export function googleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || "";
}

export function googleClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

/** Public origin of the API; Google redirects to <origin>/api/auth/callback/google. */
export function apiPublicUrl(): string {
  return process.env.API_PUBLIC_URL || "http://localhost:4000";
}

/** Origin of the UI; better-auth only redirects back to trusted origins. */
export function uiUrl(): string {
  return process.env.UI_URL || "http://localhost:3000";
}

/** "json" writes mails to memory instead of sending them (e2e); otherwise Gmail is used. */
export function mailTransport(): "gmail" | "json" {
  return process.env.MAIL_TRANSPORT === "json" ? "json" : "gmail";
}

/** Mounts the test-only API (/api/testing): seeding, reset and sign-in for e2e. Never set this in a deployment. */
export function e2eTesting(): boolean {
  return process.env.E2E_TESTING === "true";
}

/** Runs pending database migrations when the API starts (containers that bring their own database). */
export function migrateOnStart(): boolean {
  return process.env.MIGRATE_ON_START === "true";
}
