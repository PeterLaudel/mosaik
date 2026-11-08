import { Controller, Inject } from "@nestjs/common";
import { Implement } from "@orpc/nest";
import { implement } from "@orpc/server";
import { sessionsContract } from "./contract";
import { SessionsService } from "./service";

const procedures = implement(sessionsContract);

@Controller()
export class SessionsController {
  constructor(@Inject(SessionsService) private readonly sessionsService: SessionsService) {}

  @Implement(sessionsContract)
  sessions() {
    return {
      filter: procedures.filter.handler(({ input }) => this.sessionsService.filter(input)),
      find: procedures.find.handler(({ input }) => this.sessionsService.find(input.id)),
      findOpenSession: procedures.findOpenSession.handler(({ input }) =>
        this.sessionsService.findOpenSession(input.patientId),
      ),
      findPreviousSession: procedures.findPreviousSession.handler(({ input }) =>
        this.sessionsService.findPreviousSession(input.patientId, input.sessionNumber),
      ),
      createDraft: procedures.createDraft.handler(({ input }) =>
        this.sessionsService.createDraft(input.patientId),
      ),
      update: procedures.update.handler(({ input }) => {
        const { id, ...data } = input;
        return this.sessionsService.update(id, data);
      }),
      getPseudonymizedText: procedures.getPseudonymizedText.handler(({ input }) =>
        this.sessionsService.getPseudonymizedText(input.sessionIds),
      ),
    };
  }
}
