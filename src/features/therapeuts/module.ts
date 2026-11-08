import { Module } from "@nestjs/common";
import { DATABASE } from "@/shared/database/module";
import { Database } from "@/initialize";
import { TherapeutsController } from "./controller";
import { TherapeutRepository } from "./repository";
import { TherapeutsService } from "./service";

// Repository and service are internal providers; the controller is the feature's only surface
@Module({
  controllers: [TherapeutsController],
  providers: [
    {
      provide: TherapeutRepository,
      useFactory: (database: Database) => new TherapeutRepository(database),
      inject: [DATABASE],
    },
    {
      provide: TherapeutsService,
      useFactory: (repository: TherapeutRepository) => new TherapeutsService(repository),
      inject: [TherapeutRepository],
    },
  ],
  exports: [],
})
export class TherapeutsModule {}
