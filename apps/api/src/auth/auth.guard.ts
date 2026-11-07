import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { authSecret, isProduction } from "../environment";
import type { AuthenticatedRequest } from "../orpc";
import { IS_PUBLIC } from "./public.decorator";
import { decodeSession, SESSION_COOKIE } from "./sessionToken";

/**
 * Global guard: attaches the decrypted session to `request.session`.
 * Sign-in is only enforced in production, matching the old Next.js middleware
 * (local development runs without Google credentials).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[SESSION_COOKIE] as string | undefined;
    request.session = (token && (await decodeSession(token, authSecret()))) || undefined;

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic || request.session || !isProduction()) return true;

    throw new UnauthorizedException();
  }
}
