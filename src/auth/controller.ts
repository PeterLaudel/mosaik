import { Controller } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { ORPCError, implement } from "@orpc/server";
import { authContract } from "./contract";

const procedures = implement(authContract);

// Sign-in, the OAuth callback and sign-out are better-auth's own routes (see AUTH_BASE_PATH);
// this controller only exposes the signed-in user through the oRPC contract.
@Controller()
export class AuthController {
  @Implement(authContract)
  auth() {
    return {
      me: procedures.me.handler(({ context }) => {
        if (!context.auth) throw new ORPCError("UNAUTHORIZED");
        const { email, name } = context.auth.user;
        return { email, name };
      }),
    };
  }
}
