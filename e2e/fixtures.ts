import { test as baseTest } from "@playwright/test";
import { signIn } from "@/shared/testing/session";
import { getDb } from "@/initialize";
import { clearDatabase } from "@/database";

export const test = baseTest.extend<NonNullable<unknown>>({
  page: async ({ page, context }, use) => {
    // A real better-auth session in the database, handed to the browser as its cookie
    const { cookies } = await signIn();
    const browserCookies = cookies.map((cookie) => ({ ...cookie, domain: "localhost" }));
    await context.addCookies(browserCookies);

    await use(page);

    await clearDatabase(getDb());
  },
});

export { expect } from "@playwright/test";
