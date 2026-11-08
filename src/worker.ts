import { getDb } from "@/initialize";
import { OutboxRepository } from "@/shared/outbox/repository";
import { OutboxHandler } from "@/shared/outbox/handler";
import { sessionFinalizedHandler } from "@/features/sessions/outbox";

const POLL_INTERVAL_MS = 2000;

const HANDLERS: OutboxHandler[] = [sessionFinalizedHandler];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollOutbox(
  outboxRepository: OutboxRepository,
  handlers: OutboxHandler[] = HANDLERS,
): Promise<void> {
  const events = await outboxRepository.fetchUnprocessed();

  for (const event of events) {
    try {
      const handler = handlers.find((candidate) => candidate.eventType === event.eventType);
      if (!handler) throw new Error(`No outbox handler for ${event.eventType}`);
      await handler.handle(event.payload);
      await outboxRepository.markProcessed(event);
    } catch (error) {
      console.error(`Failed to process outbox event ${event.id} (${event.eventType})`, error);
    }
  }
}

async function run(): Promise<void> {
  const outboxRepository = new OutboxRepository(getDb());

  while (true) {
    await pollOutbox(outboxRepository);
    await sleep(POLL_INTERVAL_MS);
  }
}

if (require.main === module) {
  void run();
}
