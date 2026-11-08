import ServiceForm from "../_forms/serviceForm";
import { updateService } from "./action";
import { serverApi } from "@/lib/api/server";

interface Props {
  params: Promise<{ serviceId: number }>;
}

export default async function Page(props: Props) {
  const { serviceId } = await props.params;

  const api = await serverApi();
  const service = await api.services.find({ id: serviceId });

  return <ServiceForm action={updateService.bind(null, service.id)} initialValues={service} />;
}
