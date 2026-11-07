"use server";

import { revalidatePath } from "next/cache";
import { PatientCreate } from "@/repositories/patientsRepository";
import { getPatientsService } from "@/services";

export default async function createPatient(patient: PatientCreate) {
  const patientsService = await getPatientsService();
  await patientsService.create(patient);

  revalidatePath("/administration/patients");
}
