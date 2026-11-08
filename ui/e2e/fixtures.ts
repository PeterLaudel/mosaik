import { test as baseTest } from "@playwright/test";
import { MOCK_API_PORT, startMockApi, type MockApi } from "./support/mockApi";

const now = new Date().toISOString();
const user = { id: "user-1", email: "max.mustermann@example.com", name: "Max Mustermann", emailVerified: true, image: null, createdAt: now, updatedAt: now };
const session = { id: "session-1", userId: user.id, token: "e2e", expiresAt: "2099-01-01T00:00:00.000Z", createdAt: now, updatedAt: now };

export const test = baseTest.extend<{ mockApi: MockApi }, { api: ReturnType<typeof startMockApi> }>({
  // One mock API per worker, listening where the UI expects the real one
  api: [
    async ({}, use) => {
      const api = startMockApi({ session, user });
      await new Promise<void>((resolve) => api.server.listen(MOCK_API_PORT, resolve));
      await use(api);
      await new Promise((resolve) => api.server.close(resolve));
    },
    { scope: "worker" },
  ],

  // Automatic: every test starts with no stubs and a session cookie (the proxy only checks it exists)
  mockApi: [
    async ({ api, context }, use) => {
      api.reset();
      await context.addCookies([
        { name: "better-auth.session_token", value: "e2e", domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
      ]);
      await use(api.mockApi);
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
