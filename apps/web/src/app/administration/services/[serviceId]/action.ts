"use server";

import { ServiceSave } from "@api/src/repositories/servicesRepository";
import { getServicesRepository } from "@api/src/server";
import { revalidatePath } from "next/cache";

export async function updateService(data: ServiceSave): Promise<void> {
  const repo = await getServicesRepository();
  await repo.save(data);
  revalidatePath(`/administration/services/${data.id}`);
  revalidatePath("/administration/services");
}
