import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { dbMigrate } from "./database";
import { apiPort } from "./environment";

async function bootstrap() {
  await dbMigrate();

  const app = await NestFactory.create(AppModule);
  // Same prefix the web app proxies (/api/* → this server), so paths match on both sides
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.enableShutdownHooks();

  await app.listen(apiPort());
  console.warn(`Mosaik API listening on http://localhost:${apiPort()}/api`);
}

void bootstrap();
