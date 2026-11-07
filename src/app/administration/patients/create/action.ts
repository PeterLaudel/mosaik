"use server";

import { revalidatePath } from "next/cache";
import { Patient } from "@/models/patient";
import { getPatientsService } from "@/services";

export default async function createPatient(
  createPatient: Omit<Patient, "id">
) {
  const patientsService = await getPatientsService();
  await patientsService.save(createPatient);

  revalidatePath("/administration/patients");
}
