import "reflect-metadata";
import { INestApplication, Type } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DatabaseModule } from "@/shared/database/module";
import { OrpcModule } from "@/shared/orpc/module";

/** Boots one feature module the way the API runs it, for HTTP-level controller tests. */
export async function createFeatureApp(featureModule: Type): Promise<INestApplication> {
  const builder = Test.createTestingModule({
    imports: [OrpcModule, DatabaseModule, featureModule],
  });
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({ logger: false });
  await app.init();
  return app;
}
