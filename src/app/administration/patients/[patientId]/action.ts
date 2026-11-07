"use server";

import { PatientCreate } from "@/features/patients/model";
import { getPatientsService } from "@/features/patients";
import { revalidatePath } from "next/cache";

export async function updatePatient(id: number, patient: PatientCreate) {
  const patientsService = await getPatientsService();
  await patientsService.update({ ...patient, id });

  revalidatePath(`/administration/patients/${id}`);
  revalidatePath("/administration/patients");
}
