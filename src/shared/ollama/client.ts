import { ollamaModel, ollamaUrl } from "@/environment";

interface OllamaChatChunk {
  message: { role: string; content: string };
  done: boolean;
}

export async function generateText(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await fetch(`${ollamaUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      // Ollama buffers the full non-streamed response before sending headers, which
      // exceeds fetch's headers timeout for slower models. Streaming sends headers
      // immediately and each chunk resets the inactivity timeout, so long generations
      // no longer time out.
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  return await readStreamedContent(response.body);
}

async function readStreamedContent(body: ReadableStream<Uint8Array>): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let content = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const chunk = JSON.parse(line) as OllamaChatChunk;
      content += chunk.message.content;
    }
  }

  return content.trim();
}
