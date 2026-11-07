import { getDb } from "@/initialize";
import { OutboxRepository } from "./repository";

describe("OutboxRepository", () => {
  let outboxRepository: OutboxRepository;

  beforeEach(() => {
    outboxRepository = new OutboxRepository(getDb());
  });

  describe("#enqueue", () => {
    it("inserts an unprocessed event with a serialized payload", async () => {
      await outboxRepository.enqueue({ eventType: "session.finalized", payload: { sessionId: 42 } });

      const events = await outboxRepository.fetchUnprocessed();

      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        eventType: "session.finalized",
        payload: { sessionId: 42 },
        processedAt: null,
      });
    });
  });

  describe("#fetchUnprocessed", () => {
    it("excludes events that have already been processed", async () => {
      await outboxRepository.enqueue({ eventType: "session.finalized", payload: { sessionId: 1 } });
      const [pending] = await outboxRepository.fetchUnprocessed();
      await outboxRepository.markProcessed(pending);

      await outboxRepository.enqueue({ eventType: "session.finalized", payload: { sessionId: 2 } });

      const events = await outboxRepository.fetchUnprocessed();

      expect(events).toHaveLength(1);
      expect(events[0].payload).toEqual({ sessionId: 2 });
    });
  });

  describe("#markProcessed", () => {
    it("sets processedAt on the given event", async () => {
      await outboxRepository.enqueue({ eventType: "session.finalized", payload: { sessionId: 1 } });
      const [event] = await outboxRepository.fetchUnprocessed();

      await outboxRepository.markProcessed(event);

      const row = await getDb()
        .selectFrom("outbox")
        .select("processedAt")
        .where("id", "=", event.id)
        .executeTakeFirstOrThrow();
      expect(row.processedAt).not.toBeNull();
    });
  });
});
