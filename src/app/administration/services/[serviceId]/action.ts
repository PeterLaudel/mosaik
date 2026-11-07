"use server";

import { ServiceCreate } from "@/features/services/repository";
import { getServicesService } from "@/features/services";
import { revalidatePath } from "next/cache";

export async function updateService(id: number, data: ServiceCreate): Promise<void> {
  const servicesService = await getServicesService();
  await servicesService.update({ ...data, id });
  revalidatePath(`/administration/services/${id}`);
  revalidatePath("/administration/services");
}
