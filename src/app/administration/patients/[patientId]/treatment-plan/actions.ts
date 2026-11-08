"use server";

import { serverApi } from "@/lib/api/server";
import { TreatmentPlan, TreatmentPlanFormData } from "@/contract";

export async function createTreatmentPlan(
  patientId: number,
  data: TreatmentPlanFormData,
): Promise<TreatmentPlan> {
  const api = await serverApi();
  return api.treatmentPlans.create({ ...data, patientId });
}

export async function updateTreatmentPlan(
  id: number,
  data: TreatmentPlanFormData,
): Promise<TreatmentPlan> {
  const api = await serverApi();
  return api.treatmentPlans.update({ ...data, id });
}
