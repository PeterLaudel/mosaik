import { Module } from "@nestjs/common";
import { PatientsRepository } from "../repositories/patientsRepository";
import { DATABASE } from "../database/database.module";
import { Database } from "../initialize";
import { PatientsController } from "./patients.controller";

@Module({
  controllers: [PatientsController],
  providers: [
    {
      provide: PatientsRepository,
      useFactory: (db: Database) => new PatientsRepository(db),
      inject: [DATABASE],
    },
  ],
  exports: [PatientsRepository],
})
export class PatientsModule {}
