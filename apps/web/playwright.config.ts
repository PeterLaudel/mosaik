import path from "path";
import dotenv from "dotenv";
import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// The e2e env lives with the API; both servers (spawned below) and the fixtures share it
const apiDir = path.resolve(__dirname, "../api");
dotenv.config({ path: path.join(apiDir, ".env.e2e"), quiet: true });
dotenv.config({ path: path.join(apiDir, ".env.e2e.local"), override: true, quiet: true });
process.env.MOSAIK_ENV_DIR = apiDir;

// Overridable so e2e can run next to a dev server on the default ports
const webPort = process.env.E2E_WEB_PORT || "3000";
const apiPort = process.env.E2E_API_PORT || "3001";
const baseURL = `http://localhost:${webPort}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? "line" : "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "npm run start -w @mosaik/api",
      cwd: "../..",
      url: `http://localhost:${apiPort}/api/health`,
      env: { API_PORT: apiPort, APP_URL: baseURL },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run start -w @mosaik/web",
      cwd: "../..",
      url: baseURL,
      env: { PORT: webPort, API_URL: `http://localhost:${apiPort}` },
      reuseExistingServer: !process.env.CI,
    },
  ],
});
