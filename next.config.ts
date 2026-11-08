import { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller traced server tree for pkg; post-build copies static + public into standalone
  output: "standalone",
  // ESM-only; required so Jest (next/jest) transpiles this package from node_modules
  transpilePackages: ["@faker-js/faker"],
  // The browser talks to the API through this origin: one site, so the session cookie is
  // first-party and there is no CORS. Server components call API_URL directly.
  rewrites: () => {
    const apiUrl = process.env.API_URL || "http://localhost:4000";
    return Promise.resolve([{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }]);
  },
  redirects: () => {
    return Promise.resolve([
      {
        source: "/",
        destination: "/administration/patients",
        permanent: false,
      },
    ]);
  },
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
