"use server";

import { getTreatmentPlansService } from "@/features/treatment-plans";
import { TreatmentPlan } from "@/features/treatment-plans/model";
import { TreatmentPlanFormData } from "@/features/treatment-plans/service";

export async function createTreatmentPlan(
  patientId: number,
  data: TreatmentPlanFormData,
): Promise<TreatmentPlan> {
  const treatmentPlansService = await getTreatmentPlansService();
  return treatmentPlansService.create(patientId, data);
}

export async function updateTreatmentPlan(
  id: number,
  data: TreatmentPlanFormData,
): Promise<TreatmentPlan> {
  const treatmentPlansService = await getTreatmentPlansService();
  return treatmentPlansService.update(id, data);
}
