/** The signed-in user as every oRPC procedure sees it. */
export interface RequestUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Put on the request by the auth guard; features read it from `context.auth`
 * (e.g. invoices send mail from the signed-in Google account).
 */
export interface RequestAuth {
  user: RequestUser;
  /** A valid Google access token for the user; better-auth refreshes it when it has expired. */
  googleAccessToken(): Promise<string>;
}

declare module "@orpc/server" {
  interface DefaultInitialContext {
    auth?: RequestAuth;
  }
}
