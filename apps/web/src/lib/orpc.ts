import type { ContractRouterClient } from "@orpc/contract";
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { contract, type Contract } from "@mosaik/contract";

export type ApiClient = ContractRouterClient<Contract>;

/**
 * Browser client. Requests go to this origin's /api, which next.config.ts rewrites to the
 * NestJS API, so the session cookie is first-party and no CORS setup is needed.
 */
export const apiClient: ApiClient = createORPCClient(
  new OpenAPILink(contract, {
    url: () => `${typeof window === "undefined" ? "http://localhost" : window.location.origin}/api`,
  }),
);

/** TanStack Query helpers: `orpc.patients.list.queryOptions({ input })`, `orpc.patients.key()`, ... */
export const orpc = createTanstackQueryUtils(apiClient);
