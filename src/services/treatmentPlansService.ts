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

  async create(patientId: number, data: TreatmentPlanFormData): Promise<TreatmentPlan> {
    const patient = await this.patientsRepository.find(patientId);

    return this.treatmentPlansRepository.create({
      patient,
      therapeutId: null,
      ...data,
    });
  }

  async update(id: number, data: TreatmentPlanFormData): Promise<TreatmentPlan> {
    const existing = await this.treatmentPlansRepository.find(id);

    return this.treatmentPlansRepository.update({ ...existing, ...data, id });
  }
}
