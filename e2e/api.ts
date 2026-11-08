/** Where e2e reaches the API's test-only routes (/api/testing, mounted with E2E_TESTING=true). */
export const API_URL = process.env.API_URL || "http://localhost:4000";

export async function testingApi<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}/api/testing${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Test API ${path} failed with ${response.status}: ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
