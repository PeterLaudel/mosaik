import { Service } from "@/models/service";
import ServicesRepository, { ServiceSave } from "@/repositories/servicesRepository";

export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async save(service: ServiceSave): Promise<Service> {
    return this.servicesRepository.save(service);
  }
}
