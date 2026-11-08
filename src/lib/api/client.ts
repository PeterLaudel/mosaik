import { createORPCClient } from "@orpc/client";
import type { RouterContractClient } from "@orpc/contract";
import { OpenAPILink } from "@orpc/openapi/fetch";
import { contract, type Contract } from "@/contract";

export type Api = RouterContractClient<Contract>;

/** Every API route lives under this prefix; Next forwards it to the API (see next.config.ts). */
export const API_PREFIX = "/api";

/** Builds a client for the API at `origin` (omit it to call the current origin from the browser). */
export function createApi(options: { origin?: string; cookie?: string } = {}): Api {
  const headers = options.cookie ? { cookie: options.cookie } : {};
  const link = new OpenAPILink(contract, { origin: options.origin, url: API_PREFIX, headers });
  return createORPCClient(link);
}

/** Browser client: same origin, so the better-auth cookie goes along on its own. */
export const browserApi: Api = createApi();
