import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { ORPCError, implement } from "@orpc/server";
import type { CookieOptions, Request, Response } from "express";
import { isProduction, uiUrl } from "@/environment";
import { authContract } from "./contract";
import { GoogleOAuth } from "./google";
import { Public } from "./public";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  decodeOAuthState,
  encodeOAuthState,
  encodeSession,
  safeReturnTo,
} from "./session";

const procedures = implement(authContract);

function cookieOptions(maxAgeSeconds: number, path = "/"): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path,
    maxAge: maxAgeSeconds * 1000,
  };
}

@Controller()
export class AuthController {
  constructor(@Inject(GoogleOAuth) private readonly google: GoogleOAuth) {}

  @Implement(authContract)
  auth() {
    return {
      me: procedures.me.handler(({ context }) => {
        if (!context.user) throw new ORPCError("UNAUTHORIZED");
        return { email: context.user.email, name: context.user.name };
      }),
    };
  }

  @Public()
  @Get("auth/google")
  async signIn(@Query("returnTo") returnTo: unknown, @Res() res: Response): Promise<void> {
    const state = randomBytes(16).toString("hex");
    const oauthState = await encodeOAuthState({ state, returnTo: safeReturnTo(returnTo) });
    const options = cookieOptions(OAUTH_STATE_MAX_AGE_SECONDS, "/auth");
    res.cookie(OAUTH_STATE_COOKIE, oauthState, options);

    const authorizationUrl = this.google.authorizationUrl(state);
    res.redirect(authorizationUrl);
  }

  @Public()
  @Get("auth/google/callback")
  async callback(
    @Query("code") code: unknown,
    @Query("state") state: unknown,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const stateToken: unknown = req.cookies?.[OAUTH_STATE_COOKIE];
    const oauthState = typeof stateToken === "string" ? await decodeOAuthState(stateToken) : null;
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/auth" });

    if (!oauthState || typeof code !== "string" || state !== oauthState.state) {
      throw new BadRequestException("Invalid or expired sign-in attempt");
    }

    const account = await this.google.exchangeCode(code);
    const session = await encodeSession({ ...account, provider: "google" });
    res.cookie(SESSION_COOKIE, session, cookieOptions(SESSION_MAX_AGE_SECONDS));

    res.redirect(`${uiUrl()}${oauthState.returnTo}`);
  }

  @Public()
  @Post("auth/logout")
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(SESSION_COOKIE, { path: "/" });
  }
}
