import { Service } from "@/models/service";
import ServicesRepository, {
  ServiceCreate,
} from "@/repositories/servicesRepository";

export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async create(service: ServiceCreate): Promise<Service> {
    return this.servicesRepository.create(service);
  }

  async update(service: Service): Promise<Service> {
    return this.servicesRepository.update(service);
  }
}
