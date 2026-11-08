import { Module } from "@nestjs/common";
import { DATABASE } from "@/shared/database/module";
import { Database } from "@/initialize";
import { SessionsController } from "./controller";
import { SessionsRepository } from "./repository";
import { SessionsService } from "./service";

// Repository and service are internal providers; the controller is the feature's only surface
@Module({
  controllers: [SessionsController],
  providers: [
    {
      provide: SessionsRepository,
      useFactory: (database: Database) => new SessionsRepository(database),
      inject: [DATABASE],
    },
    {
      provide: SessionsService,
      useFactory: (repository: SessionsRepository) => new SessionsService(repository),
      inject: [SessionsRepository],
    },
  ],
  exports: [],
})
export class SessionsModule {}
