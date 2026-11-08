import { Module } from "@nestjs/common";
import { DATABASE } from "@/shared/database/module";
import { Database } from "@/initialize";
import { PatientsController } from "./controller";
import { PatientsRepository } from "./repository";
import { PatientsService } from "./service";

// Repository and service are internal providers; the controller is the feature's only surface
@Module({
  controllers: [PatientsController],
  providers: [
    {
      provide: PatientsRepository,
      useFactory: (database: Database) => new PatientsRepository(database),
      inject: [DATABASE],
    },
    {
      provide: PatientsService,
      useFactory: (repository: PatientsRepository) => new PatientsService(repository),
      inject: [PatientsRepository],
    },
  ],
  exports: [],
})
export class PatientsModule {}
