import "reflect-metadata";
import { INestApplication, Type } from "@nestjs/common";
import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { AuthModule } from "@/auth";
import { encodeSession } from "@/auth/session";
import { DatabaseModule } from "@/shared/database/module";
import { configureHttp } from "@/shared/http/setup";
import { RequestUser } from "@/shared/orpc/context";
import { OrpcModule } from "@/shared/orpc/module";

/**
 * Boots one feature module the way the API runs it (auth guard, cookies, oRPC), for HTTP-level
 * controller tests. `configure` can override providers before the module compiles.
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
  const app = moduleRef.createNestApplication({ logger: false });
  configureHttp(app);
  await app.init();
  return app;
}

export const testUser: RequestUser = {
  email: "max.mustermann@example.com",
  name: "Max Mustermann",
  provider: "test_provider",
  refreshToken: "dummy-refresh-token",
};

/** A Cookie header carrying a valid session for `user`. */
export async function sessionCookie(user: RequestUser = testUser): Promise<string> {
  const token = await encodeSession(user);
  return `mosaik_session=${token}`;
}
