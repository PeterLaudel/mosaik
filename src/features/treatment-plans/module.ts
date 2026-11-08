import { Module } from "@nestjs/common";
import { DATABASE } from "@/shared/database/module";
import { Database } from "@/initialize";
import { TreatmentPlansController } from "./controller";
import { TreatmentPlansRepository } from "./repository";
import { TreatmentPlansService } from "./service";

// Repository and service are internal providers; the controller is the feature's only surface
@Module({
  controllers: [TreatmentPlansController],
  providers: [
    {
      provide: TreatmentPlansRepository,
      useFactory: (database: Database) => new TreatmentPlansRepository(database),
      inject: [DATABASE],
    },
    {
      provide: TreatmentPlansService,
      useFactory: (repository: TreatmentPlansRepository) => new TreatmentPlansService(repository),
      inject: [TreatmentPlansRepository],
    },
  ],
  exports: [],
})
export class TreatmentPlansModule {}
