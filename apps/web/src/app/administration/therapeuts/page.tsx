import { getTherapeutsRepository } from "@api/src/server";
import { TherapeutForm } from "./therapeutForm";
import { saveTherapeut } from "./action";

export default async function Page() {
    const therapeutRepository = await getTherapeutsRepository();
    const therapeuts = await therapeutRepository.all();

    return <TherapeutForm action={saveTherapeut} therapeut={therapeuts[0]} />
}