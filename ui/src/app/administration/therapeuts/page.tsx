import { TherapeutForm } from "./therapeutForm";
import { createTherapeut, updateTherapeut } from "./action";
import { serverApi } from "@/lib/api/server";

export default async function Page() {
    const api = await serverApi();
    const therapeuts = await api.therapeuts.all();

    const therapeut = therapeuts[0];
    const action = therapeut ? updateTherapeut.bind(null, therapeut.id) : createTherapeut;

    return <TherapeutForm action={action} therapeut={therapeut} />
}