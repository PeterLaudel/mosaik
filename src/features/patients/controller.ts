import { Controller, Inject } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { patientsContract } from "./contract";
import { PatientsService } from "./service";

const procedures = implement(patientsContract);

@Controller()
export class PatientsController {
  constructor(@Inject(PatientsService) private readonly patientsService: PatientsService) {}

  @Implement(patientsContract)
  patients() {
    return {
      filter: procedures.filter.handler(({ input }) => this.patientsService.filter(input)),
      find: procedures.find.handler(({ input }) => this.patientsService.find(input.id)),
      create: procedures.create.handler(({ input }) => this.patientsService.create(input)),
      update: procedures.update.handler(({ input }) => this.patientsService.update(input)),
    };
  }
}
