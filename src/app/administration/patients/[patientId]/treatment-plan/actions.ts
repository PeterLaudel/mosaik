"use server";

import { getTreatmentPlansService } from "@/services";
import { TreatmentPlan } from "@/models/treatmentPlan";
import { TreatmentPlanFormData } from "@/services/treatmentPlansService";

export async function upsertTreatmentPlan(
  patientId: number,
  data: TreatmentPlanFormData,
  existingId?: number
): Promise<TreatmentPlan> {
  const treatmentPlansService = await getTreatmentPlansService();
  return treatmentPlansService.save(patientId, data, existingId);
}
