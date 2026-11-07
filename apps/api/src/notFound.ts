import { ORPCError } from "@orpc/nest";
import { NoResultError } from "kysely";

/** Repositories throw kysely's NoResultError from `executeTakeFirstOrThrow`; expose it as a 404. */
export async function orNotFound<T>(promise: Promise<T>, message = "Not found"): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof NoResultError) throw new ORPCError("NOT_FOUND", { message });
    throw error;
  }
}
