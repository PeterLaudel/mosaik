import { Module } from "@nestjs/common";
import { AuthModule } from "@/auth";
import { e2eTesting } from "@/environment";
import { TestingModule } from "@/testing/module";
import { DatabaseModule } from "@/shared/database/module";
import { OrpcModule } from "@/shared/orpc/module";
import { InvoicesModule } from "@/features/invoices";
import { PatientsModule } from "@/features/patients";
import { ServicesModule } from "@/features/services";
import { SessionsModule } from "@/features/sessions";
import { TherapeutsModule } from "@/features/therapeuts";
import { TreatmentPlansModule } from "@/features/treatment-plans";

@Module({
  imports: [
    OrpcModule,
    DatabaseModule,
    AuthModule,
    InvoicesModule,
    PatientsModule,
    ServicesModule,
    SessionsModule,
    TherapeutsModule,
    TreatmentPlansModule,
    // Seeding/reset/sign-in for e2e; see src/testing
    ...(e2eTesting() ? [TestingModule] : []),
  ],
})
export class AppModule {}
