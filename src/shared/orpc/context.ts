/**
 * The signed-in user as every oRPC procedure sees it. The auth module puts it on the request;
 * features read it from `context.user` (e.g. invoices send mail from this account).
 */
export interface RequestUser {
  email: string;
  name: string;
  provider: "google" | "test_provider";
  /** Google OAuth refresh token; nodemailer uses it to send through Gmail. */
  refreshToken: string;
}

declare module "@orpc/server" {
  interface DefaultInitialContext {
    user?: RequestUser;
  }
}
