import "server-only";
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { cookies } from "next/headers";
import { contract } from "@mosaik/contract";
import type { ApiClient } from "./orpc";

export const apiUrl = () => process.env.API_URL || "http://localhost:3001";

/**
 * Client for server components and server actions. Calls the API directly
 * and forwards the visitor's cookies so the API sees the same session.
 */
export const serverApiClient: ApiClient = createORPCClient(
  new OpenAPILink(contract, {
    url: `${apiUrl()}/api`,
    headers: async () => ({ cookie: (await cookies()).toString() }),
  }),
);
