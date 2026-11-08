import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";
import { authRequired } from "@/environment";
import { RequestAuth } from "@/shared/orpc/context";
import { AUTH, type Auth } from "./auth";
import { IS_PUBLIC } from "./public";

export type AuthenticatedRequest = Request & { auth?: RequestAuth };

/**
 * Runs before every Nest route: resolves the better-auth session onto `request.auth` (the oRPC
 * context reads it from there) and, when auth is required, rejects requests without one.
 * better-auth's own routes (/api/auth/*) are plain Express handlers and don't pass through here.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH) private readonly auth: Auth,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const headers = fromNodeHeaders(request.headers);
    const session = await this.auth.api.getSession({ headers });

    if (session) {
      const { id, email, name } = session.user;
      request.auth = {
        user: { id, email, name },
        googleAccessToken: () => this.googleAccessToken(id),
      };
      return true;
    }

    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets);
    if (isPublic || !authRequired()) return true;
    throw new UnauthorizedException();
  }

  private async googleAccessToken(userId: string): Promise<string> {
    const authContext = await this.auth.$context;
    const accounts = await authContext.internalAdapter.findAccounts(userId);
    const google = accounts.find((account) => account.providerId === "google");
    if (!google) throw new Error("This user has no linked Google account");

    const body = { accountId: google.id, userId };
    const { accessToken } = await this.auth.api.getAccessToken({ body });
    if (!accessToken) throw new Error("Google returned no access token");
    return accessToken;
  }
}
