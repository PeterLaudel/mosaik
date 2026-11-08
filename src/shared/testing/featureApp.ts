import "reflect-metadata";
import { INestApplication, Type } from "@nestjs/common";
import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { betterAuth } from "better-auth";
import { setTokenUtil } from "better-auth/oauth2";
import { testUtils } from "better-auth/plugins";
import { AuthModule } from "@/auth";
import { authOptions, getAuth } from "@/auth/auth";
import { DatabaseModule } from "@/shared/database/module";
import { configureHttp, httpOptions } from "@/shared/http/setup";
import { OrpcModule } from "@/shared/orpc/module";

/**
 * Boots one feature module the way the API runs it (better-auth routes, auth guard, oRPC), for
 * HTTP-level controller tests. `configure` can override providers before the module compiles.
 */
export async function createFeatureApp(
  featureModule: Type,
  configure: (builder: TestingModuleBuilder) => TestingModuleBuilder = (builder) => builder,
): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    imports: [OrpcModule, DatabaseModule, AuthModule, featureModule],
  });
  const configured = configure(builder);
  const moduleRef = await configured.compile();
  const app = moduleRef.createNestApplication(httpOptions);
  configureHttp(app);
  await app.init();
  return app;
}

// Same database and secret as the app's instance, plus better-auth's test helpers.
const testAuth = betterAuth({ ...authOptions(), plugins: [testUtils()] });

export const testUser = { email: "max.mustermann@example.com", name: "Max Mustermann" };

export interface SignedIn {
  userId: string;
  /** Value for a Cookie header that carries the session. */
  cookie: string;
}

/** Creates a user with a real better-auth session in the database. */
export async function signIn(user = testUser): Promise<SignedIn> {
  const { test } = await testAuth.$context;
  const draft = test.createUser(user);
  const saved = await test.saveUser(draft);
  const { headers } = await test.login({ userId: saved.id });
  return { userId: saved.id, cookie: headers.get("cookie") ?? "" };
}

/** Links a Google account to the user, storing the token encrypted as the OAuth callback does. */
export async function linkGoogleAccount(userId: string, accessToken: string): Promise<void> {
  const authContext = await getAuth().$context;
  const storedToken = await setTokenUtil(accessToken, authContext);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await authContext.internalAdapter.createAccount({
    userId,
    providerId: "google",
    accountId: "google-account-id",
    accessToken: storedToken,
    accessTokenExpiresAt: expiresAt,
  });
}
