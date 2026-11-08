import { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  // Type errors are caught by `npm run typecheck`, not by the build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
