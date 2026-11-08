import ServiceForm from "../_forms/serviceForm";
import { createService } from "./action";

export default function Page() {
  return <ServiceForm action={createService} />;
}
