import { oc } from "@orpc/contract";
import { z } from "zod";

export const sessionUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  picture: z.string().nullable(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

export const authContract = {
  /** Current user, or UNAUTHORIZED. Sign-in/out are plain redirects, see the API's AuthController. */
  me: oc
    .route({ method: "GET", path: "/auth/me", tags: ["auth"] })
    .output(sessionUserSchema),
};
