import type { INestApplication } from "@nestjs/common";
import cookieParser from "cookie-parser";

/** HTTP middleware the API needs before any route runs; shared by main.ts and tests. */
export function configureHttp(app: INestApplication): void {
  app.use(cookieParser());
}
