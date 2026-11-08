import { defineConfig, devices } from "@playwright/test";
import { MOCK_API_PORT } from "./e2e/support/port";

/**
 * E2E tests run the built UI against a mocked API (see e2e/support/mockApi.ts): each test stubs
 * the API responses it needs and checks the requests the UI sends. No backend or database.
 */
export default defineConfig({
  testDir: "./e2e",
  // One mock server on one port, shared by the UI server, so tests run one after another
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "line" : "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // Built with `npm run build`. The /api rewrite targets API_URL, whose default port is the
    // mock's, so server components and browser calls both reach the mock.
    command: "npm run start",
    // A page that needs no API call, so the server counts as up before the mock starts
    url: "http://localhost:3000/administration/sign-in",
    env: { API_URL: `http://localhost:${MOCK_API_PORT}` },
    reuseExistingServer: !process.env.CI,
  },
});
