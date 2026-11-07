import { type Database } from "@/initialize";

export type OutboxEventType = "session.finalized";

export interface OutboxEvent {
  id: number;
  eventType: OutboxEventType;
  // Stored as a JSON string; ParseJSONResultsPlugin (see src/database) parses it back into this shape on read.
  payload: unknown;
  processedAt: string | null;
  createdAt: string;
}

export class OutboxRepository {
  constructor(private readonly database: Database) {}

  async enqueue(event: { eventType: OutboxEventType; payload: unknown }): Promise<void> {
    await this.database
      .insertInto("outbox")
      .values({
        eventType: event.eventType,
        payload: JSON.stringify(event.payload),
        processedAt: null,
      })
      .execute();
  }

  async fetchUnprocessed(): Promise<OutboxEvent[]> {
    return await this.database
      .selectFrom("outbox")
      .selectAll()
      .where("processedAt", "is", null)
      .orderBy("id", "asc")
      .$castTo<OutboxEvent>()
      .execute();
  }

  async markProcessed(event: Pick<OutboxEvent, "id">): Promise<void> {
    await this.database
      .updateTable("outbox")
      .set({ processedAt: new Date().toISOString() })
      .where("id", "=", event.id)
      .execute();
  }
}
