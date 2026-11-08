import type { CompletedRequest, Mockttp } from "mockttp";
import type { AnySchema, InferRouterContractOutputs, InferSchemaOutput } from "@orpc/contract";
import { getOpenAPIMeta } from "@orpc/openapi";
import { contract, type Contract } from "@peterlaudel/mosaik-contract";

/** Next fixes the /api rewrite target at build time, so the mock listens on the API's default port. */
export const MOCK_API_PORT = 4000;

// Inputs as the API sees them after parsing (z.coerce leaves the raw input side `unknown`)
type Input<P> = P extends { "~orpc": { __TInputSchema?: { type: infer S } } }
  ? S extends AnySchema ? InferSchemaOutput<S> : never
  : never;
type Outputs = InferRouterContractOutputs<Contract>;

export interface Stub<I> {
  /** What the UI sent, oldest first: JSON body (or query strings for GET) plus path params like `id`. */
  calls(): Promise<Partial<I>[]>;
}

export interface MockedProcedure<I, O> {
  /** Answers with `output`, or with `output(input)` for each request. A later stub wins. */
  returns(output: O | ((input: Partial<I>) => O)): Promise<Stub<I>>;
  /** Answers with raw bytes, e.g. a PDF. */
  replies(body: Buffer, headers: Record<string, string>): Promise<Stub<I>>;
}

/** Stubs typed by the contract: `mockApi.patients.filter.returns(...)`. */
export type MockApi = {
  [F in keyof Contract]: {
    [P in keyof Contract[F] & keyof Outputs[F]]: MockedProcedure<Input<Contract[F][P]>, Outputs[F][P]>;
  };
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function mockProcedure(server: Mockttp, method: Method, path: string, priority: () => number) {
  // Numeric ids keep `/invoices/{id}` from matching `/invoices/patients`
  const params: string[] = [];
  const pattern = path.replace(/\{(\w+)\}/g, (_, name: string) => {
    params.push(name);
    return /id$/i.test(name) ? "([0-9]+)" : "([^/?]+)";
  });
  const url = new RegExp(`^https?://[^/]+/api${pattern}(?:\\?.*)?$`);

  const input = async (request: CompletedRequest) => {
    const text = request.method === "GET" ? "" : await request.body.getText();
    const payload = request.method === "GET" ? Object.fromEntries(new URL(request.url).searchParams) : JSON.parse(text || "{}");
    const values = url.exec(request.url)?.slice(1) ?? [];
    const pathValues = params.map((name, i) => [name, /id$/i.test(name) ? Number(values[i]) : decodeURIComponent(values[i])]);
    return { ...payload, ...Object.fromEntries(pathValues) } as Record<string, unknown>;
  };

  const stub = async (respond: (request: CompletedRequest) => Promise<{ body: Buffer | string; headers: Record<string, string> }>) => {
    const builders = { GET: "forGet", POST: "forPost", PUT: "forPut", PATCH: "forPatch", DELETE: "forDelete" } as const;
    const endpoint = await server[builders[method]](url)
      .asPriority(priority())
      .thenCallback(async (request) => ({ statusCode: 200, ...(await respond(request)) }));
    return { calls: async () => Promise.all((await endpoint.getSeenRequests()).map(input)) };
  };

  return {
    returns: (output: unknown) =>
      stub(async (request) => {
        const value = typeof output === "function" ? output(await input(request)) : output;
        // Like the real API: JSON for everything, including null and strings; no body for void
        if (value === undefined) return { body: "", headers: {} as Record<string, string> };
        return { body: JSON.stringify(value), headers: { "content-type": "application/json" } };
      }),
    replies: (body: Buffer, headers: Record<string, string>) => stub(() => Promise.resolve({ body, headers })),
  };
}

export function createMockApi(server: Mockttp): MockApi {
  let priority = 10;
  const next = () => ++priority;
  const features = Object.entries(contract).map(([feature, procedures]) => {
    const mocked = Object.entries(procedures).map(([name, procedure]) => {
      const meta = getOpenAPIMeta(procedure);
      if (!meta?.method || !meta.path) throw new Error(`${feature}.${name} has no OpenAPI route`);
      return [name, mockProcedure(server, meta.method as Method, meta.path, next)];
    });
    return [feature, Object.fromEntries(mocked)];
  });
  return Object.fromEntries(features) as MockApi;
}
