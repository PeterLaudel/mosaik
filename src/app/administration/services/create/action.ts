"use server";

import { ServiceCreate } from "@/repositories/servicesRepository";
import { getServicesService } from "@/services";
import { revalidatePath } from "next/cache";

export async function createService(data: ServiceCreate): Promise<void> {
  const servicesService = await getServicesService();
  await servicesService.create(data);
  revalidatePath("/administration/services");
}
