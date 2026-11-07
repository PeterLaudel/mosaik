"use server";

import { ServiceCreate } from "@/features/services/model";
import { getServicesService } from "@/features/services";
import { revalidatePath } from "next/cache";

export async function createService(data: ServiceCreate): Promise<void> {
  const servicesService = await getServicesService();
  await servicesService.create(data);
  revalidatePath("/administration/services");
}
