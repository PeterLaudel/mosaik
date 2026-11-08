import { Module } from "@nestjs/common";
import { DATABASE } from "@/shared/database/module";
import { Database } from "@/initialize";
import { InvoicesController } from "./controller";
import { InvoicesRepository } from "./repository";
import { InvoicesService } from "./service";

// Repository and service are internal providers; the controller is the feature's only surface
@Module({
  controllers: [InvoicesController],
  providers: [
    {
      provide: InvoicesRepository,
      useFactory: (database: Database) => new InvoicesRepository(database),
      inject: [DATABASE],
    },
    {
      provide: InvoicesService,
      useFactory: (repository: InvoicesRepository) => new InvoicesService(repository),
      inject: [InvoicesRepository],
    },
  ],
  exports: [],
})
export class InvoicesModule {}
