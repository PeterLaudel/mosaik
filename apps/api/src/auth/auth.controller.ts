import { Controller, Get, Post, Query, Req, Res } from "@nestjs/common";
import { contract } from "@mosaik/contract";
import { Implement, implement, ORPCError } from "@orpc/nest";
import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import { OAuth2Client } from "google-auth-library";
import {
  appUrl,
  authSecret,
  googleClientId,
  googleClientSecret,
  isProduction,
} from "../environment";
import { Public } from "./public.decorator";
import { encodeSession, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./sessionToken";

const STATE_COOKIE = "mosaik.oauth-state";
// Same path next-auth used, so the redirect URI registered in the Google console stays valid
const CALLBACK_PATH = "/api/auth/callback/google";

function oauthClient() {
  return new OAuth2Client({
    clientId: googleClientId(),
    clientSecret: googleClientSecret(),
    redirectUri: `${appUrl()}${CALLBACK_PATH}`,
  });
}

/** Only allow redirects back into the app, never to another origin. */
function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string") return "/";
  try {
    const url = new URL(value, appUrl());
    return url.origin === new URL(appUrl()).origin ? `${url.pathname}${url.search}` : "/";
  } catch {
    return "/";
  }
}

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction() && appUrl().startsWith("https://"),
  path: "/",
});

@Controller("auth")
export class AuthController {
  @Public()
  @Get("signin")
  signIn(@Query("callbackUrl") callbackUrl: string | undefined, @Res() res: Response) {
    const state = randomBytes(16).toString("hex");
    res.cookie(STATE_COOKIE, JSON.stringify({ state, callbackUrl: safeCallbackUrl(callbackUrl) }), {
      ...cookieOptions(),
      maxAge: 10 * 60 * 1000,
    });

    const url = oauthClient().generateAuthUrl({
      scope: ["openid", "profile", "email", "https://mail.google.com/"],
      access_type: "offline",
      prompt: "consent",
      state,
    });
    res.redirect(url);
  }

  @Public()
  @Get("callback/google")
  async callback(@Query("code") code: string, @Query("state") state: string, @Req() req: Request, @Res() res: Response) {
    const stored = JSON.parse((req.cookies?.[STATE_COOKIE] as string | undefined) ?? "{}") as {
      state?: string;
      callbackUrl?: string;
    };
    res.clearCookie(STATE_COOKIE, cookieOptions());
    if (!code || !state || stored.state !== state) {
      res.status(400).send("Invalid OAuth state");
      return;
    }

    const client = oauthClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({ idToken: tokens.id_token ?? "", audience: googleClientId() });
    const profile = ticket.getPayload();
    if (!profile?.email) {
      res.status(400).send("Google did not return an e-mail address");
      return;
    }

    const token = await encodeSession(
      {
        provider: "google",
        name: profile.name ?? profile.email,
        email: profile.email,
        picture: profile.picture ?? null,
        refreshToken: tokens.refresh_token ?? null,
      },
      authSecret(),
    );
    res.cookie(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_MAX_AGE_SECONDS * 1000 });
    res.redirect(safeCallbackUrl(stored.callbackUrl));
  }

  @Public()
  @Post("signout")
  signOut(@Res() res: Response) {
    res.clearCookie(SESSION_COOKIE, cookieOptions());
    res.status(204).send();
  }
}

/** oRPC procedures live on an unprefixed controller: contract paths are already absolute. */
@Controller()
export class SessionController {
  @Public()
  @Implement(contract.auth.me)
  me() {
    return implement(contract.auth.me).handler(({ context }) => {
      const session = context.request.session;
      if (!session) throw new ORPCError("UNAUTHORIZED");
      return { name: session.name, email: session.email, picture: session.picture };
    });
  }
}
