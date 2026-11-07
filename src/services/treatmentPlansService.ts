import { TreatmentGoal, TreatmentPlan } from "@/models/treatmentPlan";
import { PatientsRepository } from "@/repositories/patientsRepository";
import { TreatmentPlansRepository } from "@/repositories/treatmentPlansRepository";

export type TreatmentPlanFormData = {
  startDate: string;
  endDate: string | null;
  therapyForm: TreatmentPlan["therapyForm"];
  phase: TreatmentPlan["phase"];
  approvedSessions: number | null;
  notes: string | null;
  goals: TreatmentGoal[];
};

export class TreatmentPlansService {
  constructor(
    private readonly patientsRepository: PatientsRepository,
    private readonly treatmentPlansRepository: TreatmentPlansRepository,
  ) {}

  async save(
    patientId: number,
    data: TreatmentPlanFormData,
    existingId?: number,
  ): Promise<TreatmentPlan> {
    const patient = await this.patientsRepository.find(patientId);

    return this.treatmentPlansRepository.save({
      id: existingId,
      patient,
      therapeutId: null,
      ...data,
    });
  }
}
