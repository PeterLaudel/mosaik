"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";
import { PatientCreate } from "@/contract";

export default async function createPatient(patient: PatientCreate) {
  const api = await serverApi();
  await api.patients.create(patient);

  revalidatePath("/administration/patients");
}
