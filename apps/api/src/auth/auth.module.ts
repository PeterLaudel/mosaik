import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController, SessionController } from "./auth.controller";
import { AuthGuard } from "./auth.guard";

@Module({
  controllers: [AuthController, SessionController],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AuthModule {}
