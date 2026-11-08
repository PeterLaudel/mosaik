import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { dbMigrate } from "@/database";
import { migrateOnStart } from "@/environment";
import { configureHttp, httpOptions } from "@/shared/http/setup";
import { AppModule } from "./app.module";

const port = Number(process.env.API_PORT ?? 4000);

async function bootstrap(): Promise<void> {
  if (migrateOnStart()) await dbMigrate();
  const app = await NestFactory.create(AppModule, httpOptions);
  configureHttp(app);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 API running on http://localhost:${port}`);
}

void bootstrap();
