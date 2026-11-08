import { Controller, Inject } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { treatmentPlansContract } from "./contract";
import { TreatmentPlansService } from "./service";

const procedures = implement(treatmentPlansContract);

@Controller()
export class TreatmentPlansController {
  constructor(
    @Inject(TreatmentPlansService) private readonly treatmentPlansService: TreatmentPlansService,
  ) {}

  @Implement(treatmentPlansContract)
  treatmentPlans() {
    return {
      findByPatientId: procedures.findByPatientId.handler(({ input }) =>
        this.treatmentPlansService.findByPatientId(input.patientId),
      ),
      create: procedures.create.handler(({ input }) => {
        const { patientId, ...data } = input;
        return this.treatmentPlansService.create(patientId, data);
      }),
      update: procedures.update.handler(({ input }) => {
        const { id, ...data } = input;
        return this.treatmentPlansService.update(id, data);
      }),
    };
  }
}
