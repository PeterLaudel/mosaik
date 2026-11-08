"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api/server";
import { TherapeutCreate } from "@peterlaudel/mosaik-contract";

export async function createTherapeut(data: TherapeutCreate): Promise<void> {
  const api = await serverApi();
  await api.therapeuts.create(data);
  revalidatePath("/administration/therapeuts");
}

export async function updateTherapeut(id: number, data: TherapeutCreate): Promise<void> {
  const api = await serverApi();
  await api.therapeuts.update({ ...data, id });
  revalidatePath("/administration/therapeuts");
}
