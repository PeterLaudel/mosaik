"use server";

import { revalidatePath } from "next/cache";
import { PatientCreate } from "@/features/patients/repository";
import { getPatientsService } from "@/features/patients";

export default async function createPatient(patient: PatientCreate) {
  const patientsService = await getPatientsService();
  await patientsService.create(patient);

  revalidatePath("/administration/patients");
}
