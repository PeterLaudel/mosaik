import { getDb } from "./initialize";
import { OutboxRepository } from "./repositories/outboxRepository";
import { pollOutbox } from "./worker";
import { pseudonymizeSession } from "./server/pseudonymizer";

jest.mock("./server/pseudonymizer", () => ({
  pseudonymizeSession: jest.fn(),
}));

const mockedPseudonymizeSession = pseudonymizeSession as jest.MockedFunction<typeof pseudonymizeSession>;

describe("pollOutbox", () => {
  let outboxRepository: OutboxRepository;

  beforeEach(() => {
    mockedPseudonymizeSession.mockReset();
    outboxRepository = new OutboxRepository(getDb());
  });

  it("processes unprocessed session.finalized events and marks them processed", async () => {
    mockedPseudonymizeSession.mockResolvedValue(undefined);
    await outboxRepository.enqueue({ eventType: "session.finalized", payload: { sessionId: 7 } });

    await pollOutbox(outboxRepository);

    expect(mockedPseudonymizeSession).toHaveBeenCalledWith(7);
    expect(await outboxRepository.fetchUnprocessed()).toHaveLength(0);
  });

  it("leaves the event unprocessed for retry when handling it throws", async () => {
    mockedPseudonymizeSession.mockRejectedValue(new Error("Ollama unavailable"));
    await outboxRepository.enqueue({ eventType: "session.finalized", payload: { sessionId: 7 } });

    await pollOutbox(outboxRepository);

    expect(await outboxRepository.fetchUnprocessed()).toHaveLength(1);
  });
});
