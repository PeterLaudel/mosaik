"use server";

import { PatientCreate } from "@/repositories/patientsRepository";
import { getPatientsService } from "@/services";
import { revalidatePath } from "next/cache";

export async function updatePatient(id: number, patient: PatientCreate) {
  const patientsService = await getPatientsService();
  await patientsService.update({ ...patient, id });

  revalidatePath(`/administration/patients/${id}`);
  revalidatePath("/administration/patients");
}
