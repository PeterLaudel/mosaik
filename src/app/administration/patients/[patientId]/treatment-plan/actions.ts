"use server";

import { getTreatmentPlansService } from "@/services";
import { TreatmentPlan } from "@/models/treatmentPlan";
import { TreatmentPlanFormData } from "@/services/treatmentPlansService";

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
