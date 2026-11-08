import { ORPCModule } from "@orpc/nest";
import { mapNotFound } from "./errors";

/** The oRPC integration every feature controller runs under; shared by the app and tests. */
export const OrpcModule = ORPCModule.forRoot({ clientInterceptors: [mapNotFound] });
