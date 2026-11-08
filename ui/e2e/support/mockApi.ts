import type { CompletedRequest, MockedEndpoint, Mockttp } from "mockttp";
import {
  ProcedureContract,
  type AnySchema,
  type InferRouterContractOutputs,
  type InferSchemaOutput,
} from "@orpc/contract";
import { getOpenAPIMeta } from "@orpc/openapi";
import { contract, type Contract } from "@peterlaudel/mosaik-contract";

import { MOCK_API_PORT } from "./port";

export { MOCK_API_PORT };

/** Every API route lives under this prefix. */
const API_PREFIX = "/api";

// Inputs as the API sees them after parsing (z.coerce makes the raw input side `unknown`)
type ParsedInput<TProcedure> = TProcedure extends { "~orpc": { __TInputSchema?: { type: infer S } } }
  ? S extends AnySchema
    ? InferSchemaOutput<S>
    : never
  : never;
type Inputs = {
  [F in keyof Contract]: {
    [P in keyof Contract[F]]: ParsedInput<Contract[F][P]>;
  };
};
type Outputs = InferRouterContractOutputs<Contract>;

/** A stubbed procedure: lets a test read back what the UI sent. */
export interface ProcedureStub<TInput> {
  /**
   * Requests the UI made, oldest first: the JSON body (or query parameters for GET, as strings)
   * merged with the path parameters, so an update's `id` is included. Numeric ids are numbers.
   */
  calls(): Promise<Partial<TInput>[]>;
}

export interface MockedProcedure<TInput, TOutput> {
  /** Answers every matching request with `output`. A later stub wins over an earlier one. */
  returns(output: TOutput): Promise<ProcedureStub<TInput>>;
  /** Answers the next matching request only; afterwards earlier stubs apply again. */
  returnsOnce(output: TOutput): Promise<ProcedureStub<TInput>>;
  /** Answers each request with an output computed from its input, e.g. to echo an update back. */
  answers(respond: (input: Partial<TInput>) => TOutput): Promise<ProcedureStub<TInput>>;
  /** Answers with a raw body, e.g. PDF bytes for a File output. */
  replies(status: number, body: Buffer | string, headers?: Record<string, string>): Promise<ProcedureStub<TInput>>;
  /** Answers with an error status, e.g. 401 or 404. */
  fails(status: number): Promise<ProcedureStub<TInput>>;
}

/** Contract-typed stubs: `mockApi.patients.filter.returns(...)` stops compiling if the contract changes. */
export type MockApi = {
  [F in keyof Contract]: {
    [P in keyof Inputs[F] & keyof Outputs[F]]: MockedProcedure<Inputs[F][P], Outputs[F][P]>;
  };
};

// Ids are numeric, so `/invoices/{id}` doesn't swallow `/invoices/patients`
function paramPattern(name: string): string {
  return /id$/i.test(name) ? "[0-9]+" : "[^/?]+";
}

function urlPattern(path: string): RegExp {
  const escaped = path.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  const withParams = escaped.replace(/\{(\w+)\}/g, (_, name: string) => `(${paramPattern(name)})`);
  return new RegExp(`^https?://[^/]+${API_PREFIX}${withParams}(?:\\?.*)?$`);
}

function pathParamNames(path: string): string[] {
  return [...path.matchAll(/\{(\w+)\}/g)].map((match) => match[1]);
}

async function bodyOrQuery(request: CompletedRequest): Promise<Record<string, unknown>> {
  if (request.method === "GET") {
    const url = new URL(request.url);
    return Object.fromEntries(url.searchParams);
  }
  const text = await request.body.getText();
  if (!text) return {};
  return JSON.parse(text) as Record<string, unknown>;
}

function pathParams(request: CompletedRequest, pattern: RegExp, names: string[]): Record<string, unknown> {
  const match = pattern.exec(request.url);
  const values = names.map((name, index) => {
    const raw = match?.[index + 1] ?? "";
    const value = /id$/i.test(name) ? Number(raw) : decodeURIComponent(raw);
    return [name, value] as const;
  });
  return Object.fromEntries(values);
}

function stubOf<TInput>(
  endpoint: MockedEndpoint,
  toInput: (request: CompletedRequest) => Promise<Record<string, unknown>>,
): ProcedureStub<TInput> {
  return {
    async calls() {
      const requests = await endpoint.getSeenRequests();
      const inputs = await Promise.all(requests.map(toInput));
      return inputs as Partial<TInput>[];
    },
  };
}

function mockProcedure(server: Mockttp, procedure: ProcedureContract<never, never, never>, nextPriority: () => number) {
  const meta = getOpenAPIMeta(procedure);
  if (!meta?.path || !meta.method) throw new Error("Every contract procedure needs an OpenAPI method and path");
  const method = meta.method;
  const pattern = urlPattern(meta.path);
  const paramNames = pathParamNames(meta.path);

  const toInput = async (request: CompletedRequest) => {
    const payload = await bodyOrQuery(request);
    const params = pathParams(request, pattern, paramNames);
    return { ...payload, ...params };
  };

  const rule = () => {
    const builders = {
      GET: () => server.forGet(pattern),
      POST: () => server.forPost(pattern),
      PUT: () => server.forPut(pattern),
      PATCH: () => server.forPatch(pattern),
      DELETE: () => server.forDelete(pattern),
    } as const;
    const build = builders[method as keyof typeof builders];
    if (!build) throw new Error(`Unsupported method ${method}`);
    return build().asPriority(nextPriority());
  };

  const json = (output: unknown) => {
    // void outputs (e.g. delete) have no body; null and strings are JSON like the real API sends
    if (output === undefined) return { body: "", headers: {} };
    return { body: JSON.stringify(output), headers: { "content-type": "application/json" } };
  };

  return {
    async returns(output: unknown) {
      const { body, headers } = json(output);
      const endpoint = await rule().thenReply(200, body, headers);
      return stubOf(endpoint, toInput);
    },
    async returnsOnce(output: unknown) {
      const { body, headers } = json(output);
      const endpoint = await rule().once().thenReply(200, body, headers);
      return stubOf(endpoint, toInput);
    },
    async answers(respond: (input: Record<string, unknown>) => unknown) {
      const endpoint = await rule().thenCallback(async (request) => {
        const input = await toInput(request);
        const { body, headers } = json(respond(input));
        return { statusCode: 200, body, headers };
      });
      return stubOf(endpoint, toInput);
    },
    async replies(status: number, body: Buffer | string, headers: Record<string, string> = {}) {
      const endpoint = await rule().thenReply(status, body, headers);
      return stubOf(endpoint, toInput);
    },
    async fails(status: number) {
      const body = JSON.stringify({ defined: false, code: "MOCKED_ERROR", status, message: "Mocked error" });
      const endpoint = await rule().thenReply(status, body, { "content-type": "application/json" });
      return stubOf(endpoint, toInput);
    },
  };
}

/** Builds the typed stub API for one mock server, from the contract's routes. */
export function createMockApi(server: Mockttp): MockApi {
  // Each new stub gets a higher priority than all before it, so later stubs win
  let priority = 10;
  const nextPriority = () => {
    priority += 1;
    return priority;
  };

  const features = Object.entries(contract).map(([feature, procedures]) => {
    const mocked = Object.entries(procedures).map(([name, procedure]) => {
      if (!(procedure instanceof ProcedureContract)) throw new Error(`${feature}.${name} is not a procedure`);
      const typed = procedure as ProcedureContract<never, never, never>;
      return [name, mockProcedure(server, typed, nextPriority)] as const;
    });
    return [feature, Object.fromEntries(mocked)] as const;
  });
  return Object.fromEntries(features) as unknown as MockApi;
}
