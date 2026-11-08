import { getServicesService } from "@/features/services/legacy";
import ServiceForm from "../_forms/serviceForm";
import { updateService } from "./action";

interface Props {
  params: Promise<{ serviceId: number }>;
}

export default async function Page(props: Props) {
  const { serviceId } = await props.params;

  const servicesService = await getServicesService();
  const service = await servicesService.find(serviceId);

  return <ServiceForm action={updateService.bind(null, service.id)} initialValues={service} />;
}
