"use server";

import { ServiceSave } from "@/repositories/servicesRepository";
import { getServicesService } from "@/services";
import { revalidatePath } from "next/cache";

export async function updateService(data: ServiceSave): Promise<void> {
  const servicesService = await getServicesService();
  await servicesService.save(data);
  revalidatePath(`/administration/services/${data.id}`);
  revalidatePath("/administration/services");
}
