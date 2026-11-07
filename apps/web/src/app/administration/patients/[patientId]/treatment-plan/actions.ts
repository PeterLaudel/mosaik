"use server";

import { getPatientsRepository, getTreatmentPlansRepository } from "@api/src/server";
import { TreatmentPlan, TreatmentGoal } from "@mosaik/contract/models/treatmentPlan";

export type TreatmentPlanFormData = {
  startDate: string;
  endDate: string | null;
  therapyForm: TreatmentPlan["therapyForm"];
  phase: TreatmentPlan["phase"];
  approvedSessions: number | null;
  notes: string | null;
  goals: TreatmentGoal[];
};

export async function upsertTreatmentPlan(
  patientId: number,
  data: TreatmentPlanFormData,
  existingId?: number
): Promise<TreatmentPlan> {
  const patientRepo = await getPatientsRepository();
  const patient = await patientRepo.find(patientId);

  const repo = await getTreatmentPlansRepository();
  return repo.save({
    id: existingId,
    patient,
    therapeutId: null,
    ...data,
  });
}
