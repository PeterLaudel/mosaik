import { Controller, Inject } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { servicesContract } from "./contract";
import { ServicesService } from "./service";

const procedures = implement(servicesContract);

@Controller()
export class ServicesController {
  constructor(@Inject(ServicesService) private readonly servicesService: ServicesService) {}

  @Implement(servicesContract)
  services() {
    return {
      filter: procedures.filter.handler(({ input }) => this.servicesService.filter(input)),
      find: procedures.find.handler(({ input }) => this.servicesService.find(input.id)),
      create: procedures.create.handler(({ input }) => this.servicesService.create(input)),
      update: procedures.update.handler(({ input }) => this.servicesService.update(input)),
    };
  }
}
