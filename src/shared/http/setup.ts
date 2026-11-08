import type { INestApplication, NestApplicationOptions } from "@nestjs/common";
import { toNodeHandler } from "better-auth/node";
import type { Express } from "express";
import { AUTH, AUTH_BASE_PATH, type Auth } from "@/auth";

/**
 * better-auth and oRPC both read the raw request body, so Nest's JSON body parser stays off.
 * Pass these options to NestFactory.create / createNestApplication.
 */
export const httpOptions: NestApplicationOptions = { bodyParser: false };

/** Every API route lives under /api, so the UI can forward one path prefix to the API. */
export const API_PREFIX = "api";

/**
 * Mounts better-auth's routes and the /api prefix; call before the app initializes so
 * better-auth's routes precede Nest's.
 */
export function configureHttp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);

  const auth = app.get<Auth>(AUTH);
  const handler = toNodeHandler(auth);
  const express = app.getHttpAdapter().getInstance() as Express;
  express.all(`${AUTH_BASE_PATH}/*splat`, handler);
}
