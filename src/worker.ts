import { getDb } from "@/initialize";
import { OutboxRepository, OutboxEvent } from "@/shared/outbox/repository";
import { pseudonymizeSession } from "@/features/sessions/pseudonymization/pseudonymizer";

const POLL_INTERVAL_MS = 2000;

async function handleEvent(event: OutboxEvent): Promise<void> {
  switch (event.eventType) {
    case "session.finalized": {
      const { sessionId } = event.payload as { sessionId: number };
      return pseudonymizeSession(sessionId);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollOutbox(outboxRepository: OutboxRepository): Promise<void> {
  const events = await outboxRepository.fetchUnprocessed();

  for (const event of events) {
    try {
      await handleEvent(event);
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
