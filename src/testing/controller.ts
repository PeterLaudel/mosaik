import { Controller, HttpCode, NotFoundException, Param, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "@/auth";
import { clearDatabase } from "@/database";
import { getDb } from "@/initialize";
import { signIn } from "@/shared/testing/session";
import { loadFactories, type FactoryName } from "./factories";

// Nest's body parser is off (better-auth and oRPC read raw bodies), so read the JSON ourselves.
async function readJson(request: Request): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? (JSON.parse(text) as Record<string, unknown>) : {};
}

/**
 * Test-only API for e2e suites that run against the API from outside (mosaik-ui): reset the
 * database, seed rows through the table factories, and get a signed-in session. Only mounted when
 * E2E_TESTING=true; public, because tests seed and sign in before any session exists.
 */
@Public()
@Controller("testing")
export class TestingController {
  @Post("reset")
  @HttpCode(204)
  async reset(): Promise<void> {
    await clearDatabase(getDb());
  }

  @Post("factories/:name")
  async create(@Param("name") name: string, @Req() request: Request): Promise<unknown> {
    const factories = await loadFactories();
    const factory = factories[name as FactoryName];
    if (!factory) throw new NotFoundException(`Unknown factory "${name}"`);

    const attributes = await readJson(request);
    // Each factory accepts the attributes of its own table
    return (factory.create as (params: Record<string, unknown>) => Promise<unknown>)(attributes);
  }

  @Post("sign-in")
  async signIn(): Promise<{ cookies: Awaited<ReturnType<typeof signIn>>["cookies"] }> {
    const { cookies } = await signIn();
    return { cookies };
  }
}
