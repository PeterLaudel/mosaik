import { Module } from "@nestjs/common";
import { DATABASE } from "../database/database.module";
import { Database } from "../initialize";
import { InvoicesRepository } from "../repositories/invoicesRepository";
import { TherapeutRepository } from "../repositories/therapeutRepository";
import { InvoicesController } from "./invoices.controller";

@Module({
  controllers: [InvoicesController],
  providers: [
    { provide: InvoicesRepository, useFactory: (db: Database) => new InvoicesRepository(db), inject: [DATABASE] },
    { provide: TherapeutRepository, useFactory: (db: Database) => new TherapeutRepository(db), inject: [DATABASE] },
  ],
})
export class InvoicesModule {}
