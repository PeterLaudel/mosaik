import { Service, ServiceCreate } from "./model";
import ServicesRepository from "./repository";

export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  async find(id: number): Promise<Service> {
    return this.servicesRepository.find(id);
  }

  async filter(
    params: Parameters<ServicesRepository["filter"]>[0],
  ): Promise<{ rows: Service[]; total: number }> {
    return this.servicesRepository.filter(params);
  }

  async create(service: ServiceCreate): Promise<Service> {
    return this.servicesRepository.create(service);
  }

  async update(service: Service): Promise<Service> {
    return this.servicesRepository.update(service);
  }
}
