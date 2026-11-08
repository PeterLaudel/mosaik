import { oc } from "@orpc/contract";
import { openapi } from "@orpc/openapi";
import { z } from "zod";

// Only what the UI needs to show who is signed in; tokens never leave the session cookie.
export const currentUserSchema = z.object({
  email: z.string(),
  name: z.string(),
});

// The OAuth redirects (/auth/google, /auth/google/callback, /auth/logout) are plain HTTP routes
// in controller.ts; they set cookies and redirect, which is not a request/response procedure.
export const authContract = {
  me: oc.meta(openapi({ method: "GET", path: "/auth/me" })).output(currentUserSchema),
};
