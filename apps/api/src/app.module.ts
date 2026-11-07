import { Module } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { onError, ORPCError, ORPCModule } from "@orpc/nest";
import type { Request } from "express";
import { AuthModule } from "./auth/auth.module";
import { DatabaseModule } from "./database/database.module";
import { testEndpointsEnabled } from "./environment";
import { HealthController } from "./health/health.controller";
import { InvoicesModule } from "./invoices/invoices.module";
import { PatientsModule } from "./patients/patients.module";
import { TestingController } from "./testing/testing.controller";
import "./orpc";

@Module({
  imports: [
    ORPCModule.forRootAsync({
      useFactory: (request: Request) => ({
        interceptors: [
          onError((error) => {
            // Expected client errors (validation, 404, 401) are part of the contract, not failures
            if (error instanceof ORPCError && error.status < 500) return;
            console.error(error);
          }),
        ],
        context: { request },
      }),
      inject: [REQUEST],
    }),
    DatabaseModule,
    AuthModule,
    PatientsModule,
    InvoicesModule,
  ],
  controllers: [HealthController, ...(testEndpointsEnabled() ? [TestingController] : [])],
})
export class AppModule {}
