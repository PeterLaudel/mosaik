import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./controller";
import { GoogleOAuth } from "./google";
import { AuthGuard } from "./guard";

@Module({
  controllers: [AuthController],
  providers: [
    { provide: GoogleOAuth, useFactory: () => new GoogleOAuth() },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [],
})
export class AuthModule {}
