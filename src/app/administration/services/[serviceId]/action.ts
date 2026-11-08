"use server";

import { ServiceCreate } from "@/features/services/model";
import { getServicesService } from "@/features/services/legacy";
import { revalidatePath } from "next/cache";

export async function updateService(id: number, data: ServiceCreate): Promise<void> {
  const servicesService = await getServicesService();
  await servicesService.update({ ...data, id });
  revalidatePath(`/administration/services/${id}`);
  revalidatePath("/administration/services");
}
