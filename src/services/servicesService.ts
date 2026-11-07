import { Service } from "@/models/service";
import ServicesRepository, {
  ServiceCreate,
  ServiceUpdate,
} from "@/repositories/servicesRepository";

export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async create(service: ServiceCreate): Promise<Service> {
    return this.servicesRepository.create(service);
  }

  async update(service: ServiceUpdate): Promise<Service> {
    return this.servicesRepository.update(service);
  }
}
