import { OutboxHandler } from "@/shared/outbox/handler";
import { pseudonymizeSession } from "./pseudonymization/pseudonymizer";

export const sessionFinalizedHandler: OutboxHandler = {
  eventType: "session.finalized",
  handle(payload) {
    const { sessionId } = payload as { sessionId: number };
    return pseudonymizeSession(sessionId);
  },
};
