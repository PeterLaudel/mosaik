import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { configureHttp } from "@/shared/http/setup";
import { AppModule } from "./app.module";

const port = Number(process.env.API_PORT ?? 4000);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureHttp(app);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 API running on http://localhost:${port}`);
}

void bootstrap();
