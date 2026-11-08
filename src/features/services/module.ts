import { Module } from "@nestjs/common";
import { DATABASE } from "@/shared/database/module";
import { Database } from "@/initialize";
import { ServicesController } from "./controller";
import ServicesRepository from "./repository";
import { ServicesService } from "./service";

// Repository and service are internal providers; the controller is the feature's only surface
@Module({
  controllers: [ServicesController],
  providers: [
    {
      provide: ServicesRepository,
      useFactory: (database: Database) => new ServicesRepository(database),
      inject: [DATABASE],
    },
    {
      provide: ServicesService,
      useFactory: (repository: ServicesRepository) => new ServicesService(repository),
      inject: [ServicesRepository],
    },
  ],
  exports: [],
})
export class ServicesModule {}
