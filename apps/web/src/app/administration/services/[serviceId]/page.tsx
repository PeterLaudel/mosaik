import { getServicesRepository } from "@api/src/server";
import ServiceForm from "../_forms/serviceForm";
import { updateService } from "./action";

interface Props {
  params: Promise<{ serviceId: number }>;
}

export default async function Page(props: Props) {
  const { serviceId } = await props.params;

  const serviceRepository = await getServicesRepository();
  const service = await serviceRepository.find(serviceId);

  return <ServiceForm action={updateService} initialValues={service} />;
}
