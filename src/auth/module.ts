import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AUTH, getAuth } from "./auth";
import { AuthController } from "./controller";
import { AuthGuard } from "./guard";

@Module({
  controllers: [AuthController],
  providers: [
    { provide: AUTH, useFactory: getAuth },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [],
})
export class AuthModule {}
