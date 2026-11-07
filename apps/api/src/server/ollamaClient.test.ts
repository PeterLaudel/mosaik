import { generateText } from "./ollamaClient";

function streamFromChunks(chunks: object[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(`${JSON.stringify(chunk)}\n`));
      }
      controller.close();
    },
  });
}

describe("generateText", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("concatenates streamed content chunks into the final text", async () => {
    const body = streamFromChunks([
      { message: { role: "assistant", content: "Hallo " }, done: false },
      { message: { role: "assistant", content: "Welt" }, done: false },
      { message: { role: "assistant", content: "" }, done: true },
    ]);
    global.fetch = jest.fn().mockResolvedValue(new Response(body, { status: 200 })) as typeof fetch;

    const result = await generateText("system prompt", "user message");

    expect(result).toBe("Hallo Welt");
  });

  it("throws when the response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response(null, { status: 500 })) as typeof fetch;

    await expect(generateText("system prompt", "user message")).rejects.toThrow(
      "Ollama request failed with status 500"
    );
  });
});
