export async function safeJson<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null as T | null;
  }

  return JSON.parse(text) as T;
}
