"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";
import { PatientCreate } from "@/contract";

export async function updatePatient(id: number, patient: PatientCreate) {
  const api = await serverApi();
  await api.patients.update({ ...patient, id });

  revalidatePath(`/administration/patients/${id}`);
  revalidatePath("/administration/patients");
}
