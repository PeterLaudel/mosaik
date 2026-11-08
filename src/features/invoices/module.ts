import { Module } from "@nestjs/common";
import { DATABASE } from "@/shared/database/module";
import { Database } from "@/initialize";
import { mailTransport } from "@/environment";
import { InvoicesController } from "./controller";
import { SentMailController } from "./testing";
import { InvoicesRepository } from "./repository";
import { InvoicesService } from "./service";

// The sent-mail route only exists when mails stay in memory (e2e)
const controllers =
  mailTransport() === "json" ? [InvoicesController, SentMailController] : [InvoicesController];

// Repository and service are internal providers; the controller is the feature's only surface
@Module({
  controllers,
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
