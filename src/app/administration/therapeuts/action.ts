"use server";

import { TherapeutSave } from "@/repositories/therapeutRepository";
import { getTherapeutsService } from "@/services";
import { revalidatePath } from "next/cache";

export async function saveTherapeut(data: TherapeutSave): Promise<void> {
  const therapeutsService = await getTherapeutsService();
  await therapeutsService.save(data);
  revalidatePath("/administration/therapeuts");
}
