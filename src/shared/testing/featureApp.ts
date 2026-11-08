import "reflect-metadata";
import { INestApplication, Type } from "@nestjs/common";
import { Test, TestingModuleBuilder } from "@nestjs/testing";
import { AuthModule } from "@/auth";
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

export { linkGoogleAccount, signIn, testUser, type SignedIn } from "./session";
