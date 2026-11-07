import { Service } from "./model";
import ServicesRepository, {
  ServiceCreate,
} from "./repository";

export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async create(service: ServiceCreate): Promise<Service> {
    return this.servicesRepository.create(service);
  }

  async update(service: Service): Promise<Service> {
    return this.servicesRepository.update(service);
  }
}
