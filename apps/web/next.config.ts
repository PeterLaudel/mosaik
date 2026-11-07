import path from "path";
import { NextConfig } from "next";

const apiUrl = process.env.API_URL || "http://localhost:3001";

// Transitional: domains not yet moved behind the API still import apps/api code through the
// `@api/*` alias (see tsconfig.json). Point that code at apps/api's .env files and database.
// Remove together with the alias once every domain is served by the API.
process.env.MOSAIK_ENV_DIR ??= path.resolve(__dirname, "../api");

const nextConfig: NextConfig = {
  // Smaller traced server tree for pkg; post-build copies static + public into standalone
  output: "standalone",
  // Monorepo root, so tracing and Turbopack can follow workspace packages and the @api bridge
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  turbopack: { root: path.resolve(__dirname, "../..") },
  redirects: () => {
    return Promise.resolve([
      {
        source: "/",
        destination: "/administration/patients",
        permanent: false,
      },
    ]);
  },
  // `fallback` runs after Next's own routes: legacy app/api/* handlers still win, everything
  // else under /api (patients, auth, invoice mailing, ...) is proxied to the NestJS API
  rewrites: () =>
    Promise.resolve({
      beforeFiles: [],
      afterFiles: [],
      fallback: [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }],
    }),
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ["pdfkit", "better-sqlite3"],
  webpack: (config, { isServer }) => {
    if (!isServer) return config;
    const prev = config.externals;
    // Force pg to load via require() instead of import() so pkg's virtual
    // filesystem can resolve it (pkg only patches CJS require, not ESM import)
    const pgExternals: typeof prev = [
      ({ request }: { request?: string }, callback: (err?: null, result?: string) => void) => {
        if (request === "pg") return callback(null, "commonjs pg");
        callback();
      },
      ...(Array.isArray(prev) ? prev : prev ? [prev] : []),
    ];
    return { ...config, externals: pgExternals };
  },
};

export default nextConfig;
