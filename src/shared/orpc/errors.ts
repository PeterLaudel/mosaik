import { NoResultError } from "kysely";
import { ORPCError } from "@orpc/server";

/** Repositories throw Kysely's NoResultError for a missing row; clients should see a 404. */
export async function mapNotFound<T>({ next }: { next: () => Promise<T> }): Promise<T> {
  try {
    return await next();
  } catch (error) {
    if (error instanceof NoResultError) {
      throw new ORPCError("NOT_FOUND", { cause: error });
    }
    throw error;
  }
}
