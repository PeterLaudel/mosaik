import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { authRequired } from "@/environment";
import { RequestUser } from "@/shared/orpc/context";
import { IS_PUBLIC } from "./public";
import { SESSION_COOKIE, decodeSession } from "./session";

export type AuthenticatedRequest = Request & { user?: RequestUser };

/**
 * Runs before every route: decodes the session cookie onto `request.user` (the oRPC context reads
 * it from there) and, when auth is required, rejects requests without a valid session.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token: unknown = request.cookies?.[SESSION_COOKIE];
    const user = typeof token === "string" ? await decodeSession(token) : null;
    if (user) {
      request.user = user;
      return true;
    }

    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, targets);
    if (isPublic || !authRequired()) return true;

    throw new UnauthorizedException();
  }
}
