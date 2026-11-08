import { test as baseTest } from "@playwright/test";
import { testingApi } from "./api";

interface TestCookie {
  name: string;
  value: string;
  path: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  expires?: number;
}

export const test = baseTest.extend<NonNullable<unknown>>({
  page: async ({ page, context }, use) => {
    // A real better-auth session from the API's test routes, handed to the browser as its cookie
    const { cookies } = await testingApi<{ cookies: TestCookie[] }>("/sign-in");
    const browserCookies = cookies.map((cookie) => ({ ...cookie, domain: "localhost" }));
    await context.addCookies(browserCookies);

    await use(page);

    await testingApi("/reset");
  },
});

export { expect } from "@playwright/test";
