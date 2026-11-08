import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

// Only what the UI needs to show who is signed in; tokens never leave the session cookie.
export const currentUserSchema = z.object({
  email: z.string(),
  name: z.string(),
});

// Signing in and out goes through better-auth's own routes under /api/auth (use its client);
// the contract only answers who is signed in, for the UI's server components.
export const authContract = {
  me: oc.meta(openapi({ method: "GET", path: "/me" })).output(currentUserSchema),
};
