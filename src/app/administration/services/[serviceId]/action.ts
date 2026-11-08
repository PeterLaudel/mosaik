"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";
import { ServiceCreate } from "@/contract";

export async function updateService(id: number, data: ServiceCreate): Promise<void> {
  const api = await serverApi();
  await api.services.update({ ...data, id });
  revalidatePath(`/administration/services/${id}`);
  revalidatePath("/administration/services");
}
