import { test as baseTest } from "@playwright/test";
import { http, HttpResponse } from "msw";
import { MOCK_API_PORT, mockApi, startMockServer, type Mock } from "./support/mockApi";

const now = new Date().toISOString();
const user = { id: "user-1", email: "max.mustermann@example.com", name: "Max Mustermann", emailVerified: true, image: null, createdAt: now, updatedAt: now };
const session = { id: "session-1", userId: user.id, token: "e2e", expiresAt: "2099-01-01T00:00:00.000Z", createdAt: now, updatedAt: now };
// better-auth's session endpoint isn't part of the contract
const signedIn = http.get("*/api/auth/get-session", () => HttpResponse.json({ session, user }));

export const test = baseTest.extend<{ mock: Mock }, { mockServer: ReturnType<typeof startMockServer> }>({
  mockServer: [
    async ({}, use) => {
      const mock = startMockServer([signedIn]);
      await new Promise<void>((resolve) => mock.server.listen(MOCK_API_PORT, resolve));
      await use(mock);
      await new Promise((resolve) => mock.server.close(resolve));
    },
    { scope: "worker" },
  ],

  // Automatic: every test starts with no handlers and a session cookie (the proxy only checks it exists)
  mock: [
    async ({ mockServer, context }, use) => {
      mockServer.reset();
      await context.addCookies([
        { name: "better-auth.session_token", value: "e2e", domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
      ]);
      await use(mockApi((handler) => mockServer.use(handler)));
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";

export type { Mock } from "./support/mockApi";
