import type { Request } from "express";
import type { Session } from "./auth/sessionToken";

export type AuthenticatedRequest = Request & { session?: Session };

declare module "@orpc/nest" {
  /** Available as `context` in every oRPC handler. */
  interface ORPCGlobalContext {
    request: AuthenticatedRequest;
  }
}
