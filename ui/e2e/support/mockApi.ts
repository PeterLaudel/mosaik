import { createServer, type Server } from "node:http";
import type { AnySchema, InferRouterContractOutputs, InferSchemaOutput } from "@orpc/contract";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { implement, ORPCError } from "@orpc/server";
import { contract, type Contract } from "@peterlaudel/mosaik-contract";

/** Next fixes the /api rewrite target at build time, so the mock listens on the API's default port. */
export const MOCK_API_PORT = 4000;

// The input as a handler receives it, after the contract's schema parsed it
type Input<P> = P extends { "~orpc": { __TInputSchema?: { type: infer S } } }
  ? S extends AnySchema ? InferSchemaOutput<S> : never
  : never;
type Outputs = InferRouterContractOutputs<Contract>;

export interface MockedProcedure<I, O> {
  /** Answers with `output`, or with `output(input)` for each call. A later stub replaces it. */
  returns(output: O | ((input: I) => O)): Promise<{ calls(): Promise<I[]> }>;
}

/** Stubs typed by the contract: `mockApi.patients.filter.returns(...)`. */
export type MockApi = {
  [F in keyof Contract]: {
    [P in keyof Contract[F] & keyof Outputs[F]]: MockedProcedure<Input<Contract[F][P]>, Outputs[F][P]>;
  };
};

type Procedures = Record<string, Record<string, { handler(fn: (options: { input: unknown }) => unknown): unknown }>>;

/**
 * The API, served by oRPC from the contract like the real one (same routes, path params,
 * serialization and input/output validation), but each procedure answers with what the test
 * stubbed and records the inputs it got. `session` answers better-auth's get-session.
 */
export function startMockApi(session: object): { mockApi: MockApi; reset(): void; server: Server } {
  const stubs = new Map<string, (input: unknown) => unknown>();
  const calls = new Map<string, unknown[]>();
  const implementer = implement(contract) as unknown as Procedures;

  const router: Record<string, Record<string, unknown>> = {};
  const mockApi: Record<string, Record<string, unknown>> = {};
  for (const [feature, procedures] of Object.entries(contract)) {
    router[feature] = {};
    mockApi[feature] = {};
    for (const name of Object.keys(procedures)) {
      const key = `${feature}.${name}`;
      router[feature][name] = implementer[feature][name].handler(({ input }) => {
        calls.set(key, [...(calls.get(key) ?? []), input]);
        const respond = stubs.get(key);
        if (!respond) {
          console.error(`Unmocked API call: ${key}`);
          throw new ORPCError("NOT_IMPLEMENTED", { message: `Unmocked API call: ${key}` });
        }
        return respond(input);
      });
      mockApi[feature][name] = {
        returns: (output: unknown) => {
          stubs.set(key, typeof output === "function" ? (output as (input: unknown) => unknown) : () => output);
          return Promise.resolve({ calls: () => Promise.resolve(calls.get(key) ?? []) });
        },
      };
    }
  }

  const handler = new OpenAPIHandler(router as never);
  const server = createServer((request, response) => {
    // better-auth's session endpoint isn't part of the contract
    if (request.url?.startsWith("/api/auth/get-session")) {
      response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(session));
      return;
    }
    void handler.handle(request, response, { prefix: "/api" }).then(({ matched }) => {
      if (matched) return;
      console.error(`Unmocked API call: ${request.method} ${request.url}`);
      response.writeHead(404).end();
    });
  });

  const reset = () => {
    stubs.clear();
    calls.clear();
  };
  return { mockApi: mockApi as MockApi, reset, server };
}
