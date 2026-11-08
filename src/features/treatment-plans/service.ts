import { TreatmentPlan, TreatmentPlanFormData } from "./model";
import { TreatmentPlansRepository } from "./repository";

export type { TreatmentPlanFormData } from "./model";

export class TreatmentPlansService {
  constructor(private readonly treatmentPlansRepository: TreatmentPlansRepository) {}

  async findByPatientId(patientId: number): Promise<TreatmentPlan | null> {
    return this.treatmentPlansRepository.findByPatientId(patientId);
  }

  async create(patientId: number, data: TreatmentPlanFormData): Promise<TreatmentPlan> {
    return this.treatmentPlansRepository.create({
      patient: { id: patientId },
      therapeutId: null,
      ...data,
    });
  }

  async update(id: number, data: TreatmentPlanFormData): Promise<TreatmentPlan> {
    const existing = await this.treatmentPlansRepository.find(id);

    return this.treatmentPlansRepository.update({ ...existing, ...data, id });
  }
}
