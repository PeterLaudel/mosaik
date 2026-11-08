import { test as baseTest } from "@playwright/test";
import { getLocal, type Mockttp } from "mockttp";
import { createMockApi, MOCK_API_PORT, type MockApi } from "./support/mockApi";

export const signedInUser = { email: "max.mustermann@example.com", name: "Max Mustermann" };

type TestFixtures = {
  /** Contract-typed stubs for this test; every test starts with none (besides the session). */
  mockApi: MockApi;
};

type WorkerFixtures = {
  mockServer: Mockttp;
};

export const test = baseTest.extend<TestFixtures, WorkerFixtures>({
  mockServer: [
    async ({}, use) => {
      const server = getLocal();
      await server.start(MOCK_API_PORT);
      await use(server);
      await server.stop();
    },
    { scope: "worker" },
  ],

  // Automatic: every test gets a fresh mock and a session cookie, even if it doesn't use mockApi
  mockApi: [
    async ({ mockServer, context }, use) => {
      mockServer.reset();

      // better-auth's session endpoint, so the navbar shows a signed-in user
      const now = new Date().toISOString();
      const user = { id: "user-1", emailVerified: true, image: null, createdAt: now, updatedAt: now, ...signedInUser };
      const session = { id: "session-1", userId: user.id, token: "e2e", expiresAt: "2099-01-01T00:00:00.000Z", createdAt: now, updatedAt: now };
      await mockServer.forGet(/\/api\/auth\/get-session/).thenJson(200, { session, user });

      // A call the test didn't stub fails loudly instead of hanging on a 503 page
      await mockServer.forUnmatchedRequest().thenCallback((request) => {
        console.error(`Unmocked API call: ${request.method} ${request.url}`);
        return { statusCode: 501, json: { message: `Unmocked API call: ${request.method} ${request.url}` } };
      });

      // The proxy only checks that a session cookie exists; the mocked API accepts any request
      await context.addCookies([
        { name: "better-auth.session_token", value: "e2e", domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
      ]);

      await use(createMockApi(mockServer));
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
