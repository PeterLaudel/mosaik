import { Controller, Inject } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { therapeutsContract } from "./contract";
import { TherapeutsService } from "./service";

const procedures = implement(therapeutsContract);

@Controller()
export class TherapeutsController {
  constructor(@Inject(TherapeutsService) private readonly therapeutsService: TherapeutsService) {}

  @Implement(therapeutsContract)
  therapeuts() {
    return {
      all: procedures.all.handler(() => this.therapeutsService.all()),
      create: procedures.create.handler(({ input }) => this.therapeutsService.create(input)),
      update: procedures.update.handler(({ input }) => this.therapeutsService.update(input)),
    };
  }
}
