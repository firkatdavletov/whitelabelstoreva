const BODY_PREVIEW_MAX_LENGTH = 180;

type InvalidJsonResponseErrorOptions = {
  contentType: string | null;
  preview: string;
  statusCode: number;
};

export class InvalidJsonResponseError extends Error {
  readonly contentType: string | null;

  readonly preview: string;

  readonly statusCode: number;

  constructor({
    contentType,
    preview,
    statusCode,
  }: InvalidJsonResponseErrorOptions) {
    super(
      `Invalid JSON response from API. Status: ${statusCode}. Content-Type: ${
        contentType ?? "unknown"
      }. Body preview: ${preview || "<empty>"}`,
    );
    this.name = "InvalidJsonResponseError";
    this.contentType = contentType;
    this.preview = preview;
    this.statusCode = statusCode;
  }
}

function createBodyPreview(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, BODY_PREVIEW_MAX_LENGTH);
}

export async function safeJson<T>(response: Response) {
  const text = await response.text();

  if (!text) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new InvalidJsonResponseError({
      contentType: response.headers.get("content-type"),
      preview: createBodyPreview(text),
      statusCode: response.status,
    });
  }
}
