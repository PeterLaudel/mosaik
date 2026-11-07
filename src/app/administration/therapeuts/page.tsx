import { getTherapeutsRepository } from "@/features/therapeuts";
import { TherapeutForm } from "./therapeutForm";
import { createTherapeut, updateTherapeut } from "./action";

export default async function Page() {
    const therapeutRepository = await getTherapeutsRepository();
    const therapeuts = await therapeutRepository.all();

    const therapeut = therapeuts[0];
    const action = therapeut ? updateTherapeut.bind(null, therapeut.id) : createTherapeut;

    return <TherapeutForm action={action} therapeut={therapeut} />
}