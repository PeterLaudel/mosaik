import { getTherapeutsService } from "@/features/therapeuts/legacy";
import { TherapeutForm } from "./therapeutForm";
import { createTherapeut, updateTherapeut } from "./action";

export default async function Page() {
    const therapeutsService = await getTherapeutsService();
    const therapeuts = await therapeutsService.all();

    const therapeut = therapeuts[0];
    const action = therapeut ? updateTherapeut.bind(null, therapeut.id) : createTherapeut;

    return <TherapeutForm action={action} therapeut={therapeut} />
}