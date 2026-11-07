import { Controller } from "@nestjs/common";
import { contract } from "@mosaik/contract";
import { Implement, implement } from "@orpc/nest";
import { PatientsRepository } from "../repositories/patientsRepository";
import { orNotFound } from "../notFound";

@Controller()
export class PatientsController {
  constructor(private readonly patients: PatientsRepository) {}

  @Implement(contract.patients)
  router() {
    return {
      list: implement(contract.patients.list).handler(({ input }) => this.patients.filter(input)),

      find: implement(contract.patients.find).handler(({ input }) =>
        orNotFound(this.patients.find(input.id), `Patient ${input.id} not found`),
      ),

      create: implement(contract.patients.create).handler(({ input }) => this.patients.save(input)),

      update: implement(contract.patients.update).handler(async ({ input }) => {
        await orNotFound(this.patients.find(input.id), `Patient ${input.id} not found`);
        return this.patients.save(input);
      }),
    };
  }
}
