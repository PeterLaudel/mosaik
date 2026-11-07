"use server";

import { TherapeutCreate } from "@/features/therapeuts/repository";
import { getTherapeutsService } from "@/features/therapeuts";
import { revalidatePath } from "next/cache";

export async function createTherapeut(data: TherapeutCreate): Promise<void> {
  const therapeutsService = await getTherapeutsService();
  await therapeutsService.create(data);
  revalidatePath("/administration/therapeuts");
}

export async function updateTherapeut(id: number, data: TherapeutCreate): Promise<void> {
  const therapeutsService = await getTherapeutsService();
  await therapeutsService.update({ ...data, id });
  revalidatePath("/administration/therapeuts");
}
