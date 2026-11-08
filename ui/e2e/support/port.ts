/**
 * The mock API listens where the UI expects the real one (API_URL's default port): Next fixes the
 * /api rewrite target at build time, so the built UI always forwards there.
 */
export const MOCK_API_PORT = 4000;
