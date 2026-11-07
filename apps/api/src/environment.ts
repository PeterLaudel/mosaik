import path from "path";
import * as dotenv from "dotenv";

/**
 * Directory holding the `.env.*` files and the base for relative SQLITE_URLs.
 * Defaults to the working directory (apps/api when run through npm workspaces).
 * apps/web sets MOSAIK_ENV_DIR to apps/api while it still reaches into this package
 * through the `@api/*` bridge, so both processes share one config and one database file.
 */
function envDir(): string {
  return process.env.MOSAIK_ENV_DIR || process.cwd();
}

dotenv.config({ path: [path.join(envDir(), `.env.${process.env.NODE_ENV}`)], quiet: true });
dotenv.config({ path: [path.join(envDir(), `.env.${process.env.NODE_ENV}.local`)], override: true, quiet: true });

export function sqliteUrl(): string {
  const url = process.env.SQLITE_URL || "";
  return url && !path.isAbsolute(url) ? path.resolve(envDir(), url) : url;
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

export function apiPort(): number {
  return Number(process.env.API_PORT || 3001);
}

/** Public origin of the web app; the browser reaches the API through it under /api. */
export function appUrl(): string {
  // NEXTAUTH_URL fallback keeps existing desktop installs (.env in Application Support) working
  return process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

export function authSecret(): string {
  // NEXTAUTH_SECRET fallback keeps existing desktop installs working
  return process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "";
}

export function googleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || "";
}

export function googleClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

/** Exposes /api/testing/* helpers used by the e2e suite. Never enable in a real deployment. */
export function testEndpointsEnabled(): boolean {
  return process.env.ENABLE_TEST_ENDPOINTS === "true";
}
