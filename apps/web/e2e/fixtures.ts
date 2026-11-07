import { test as baseTest } from "@playwright/test";
import { encodeSession, SESSION_COOKIE } from "@api/src/auth/sessionToken";
import { getDb } from "@api/src/initialize";
import { clearDatabase } from "@api/src/database";

export const test = baseTest.extend<NonNullable<unknown>>({
  page: async ({ page, context }, use) => {
    const token = await encodeSession(
      {
        provider: "test_provider",
        name: "Max Mustermann",
        email: "max.mustermann@example.com",
        picture: "https://example.com/avatar.png",
        refreshToken: "dummy-refresh-token",
      },
      process.env.AUTH_SECRET || "",
    );

    await context.addCookies([
      {
        name: SESSION_COOKIE,
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        expires: -1,
      },
    ]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(page);

    await clearDatabase(getDb());
  },
});

export { expect } from "@playwright/test";
