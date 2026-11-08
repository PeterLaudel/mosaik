import { createServer } from "node:http";
import type { AnyORPCError } from "@orpc/client";
import { createHTTPUtils } from "@orpc/msw";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { createRequestListener } from "@remix-run/node-fetch-server";
import { getResponse, type RequestHandler } from "msw";
import { contract } from "@peterlaudel/mosaik-contract";

/** Next fixes the /api rewrite target at build time, so the mock listens on the API's default port. */
export const MOCK_API_PORT = 4000;

/**
 * MSW handlers typed by the contract and served through oRPC like the real API:
 * `api.patients.find.handler(({ input }) => patient)`.
 */
export const api = createHTTPUtils(contract, { prefix: "/api", handler: (router) => new OpenAPIHandler(router) });

type Api = typeof api;
type Output<H> = H extends (...args: never[]) => infer R ? Exclude<Awaited<R>, AnyORPCError> : never;

/** `mock.patients.find(patient)` or `mock.patients.update(({ input }) => …)`; a later call wins. */
export type Mock = {
  [F in keyof Api]: {
    [P in keyof Api[F]]: Api[F][P] extends { handler(fn: infer H): unknown } ? (response: H | Output<H>) => void : never;
  };
};

type Builders = Record<string, Record<string, { handler(fn: unknown): RequestHandler }>>;

/** Registers a handler on `use` for each `mock.<feature>.<procedure>(…)` call. */
export function mockApi(use: (handler: RequestHandler) => void): Mock {
  const builders = api as unknown as Builders;
  const procedures = (feature: string) =>
    new Proxy({}, {
      get: (_, procedure: string) => (response: unknown) => {
        const respond = typeof response === "function" ? response : () => response;
        use(builders[feature][procedure].handler(respond));
      },
    });
  return new Proxy({}, { get: (_, feature: string) => procedures(feature) }) as Mock;
}

/** A real HTTP server (the UI's Next server calls it) answering with the current MSW handlers. */
export function startMockServer(defaults: RequestHandler[]) {
  let handlers: RequestHandler[] = [];
  const server = createServer(
    createRequestListener(async (request) => {
      const response = await getResponse([...handlers, ...defaults], request);
      if (response) return response;
      console.error(`Unmocked API call: ${request.method} ${request.url}`);
      return new Response(null, { status: 404 });
    }),
  );
  return {
    server,
    /** Adds handlers; the latest wins over earlier ones for the same procedure. */
    use: (...added: RequestHandler[]) => (handlers = [...added, ...handlers]),
    reset: () => (handlers = []),
  };
}
