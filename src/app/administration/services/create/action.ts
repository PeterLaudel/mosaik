"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";
import { ServiceCreate } from "@/contract";

export async function createService(data: ServiceCreate): Promise<void> {
  const api = await serverApi();
  await api.services.create(data);
  revalidatePath("/administration/services");
}
