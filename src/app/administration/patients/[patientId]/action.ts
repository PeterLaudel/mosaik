"use server";

import { PatientSave } from "@/repositories/patientsRepository";
import { getPatientsService } from "@/services";
import { revalidatePath } from "next/cache";

export async function updatePatient(patient: PatientSave) {
  const patientsService = await getPatientsService();
  await patientsService.save(patient);

  revalidatePath(`/administration/patients/${patient.id}`);
  revalidatePath("/administration/patients");
}
