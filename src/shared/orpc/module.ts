import type { ExecutionContext } from "@nestjs/common";
import { ORPCModule } from "@orpc/nest";
import type { DefaultInitialContext } from "@orpc/server";
import type { RequestAuth } from "./context";
import { mapNotFound } from "./errors";

// The auth guard has already put the signed-in user (if any) on the request.
function requestContext(executionContext: ExecutionContext): DefaultInitialContext {
  const request = executionContext.switchToHttp().getRequest<{ auth?: RequestAuth }>();
  return { auth: request.auth };
}

/** The oRPC integration every feature controller runs under; shared by the app and tests. */
export const OrpcModule = ORPCModule.forRoot({
  context: requestContext,
  clientInterceptors: [mapNotFound],
});
