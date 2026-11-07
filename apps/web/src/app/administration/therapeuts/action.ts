"use server";

import { TherapeutSave } from "@api/src/repositories/therapeutRepository";
import { getTherapeutsRepository } from "@api/src/server";
import { revalidatePath } from "next/cache";

export async function saveTherapeut(data: TherapeutSave): Promise<void> {
  const therapeutRepository = await getTherapeutsRepository();
  await therapeutRepository.save(data);
  revalidatePath("/administration/therapeuts");
}
