import { ApiError } from "@/shared/api/api-error";
import { createApiUrl } from "@/shared/api/create-url";
import { safeJson } from "@/shared/lib/safe-json";
import type { ApiMethod, ApiQueryParams } from "@/shared/types/api";

type ApiRequestOptions<TBody> = Omit<RequestInit, "body" | "headers" | "method"> & {
  accessToken?: string;
  body?: TBody;
  cookie?: string;
  headers?: HeadersInit;
  method?: ApiMethod;
  query?: ApiQueryParams;
};

function createHeaders(
  body: unknown,
  accessToken?: string,
  cookie?: string,
  headers?: HeadersInit,
) {
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  if (cookie) {
    requestHeaders.set("Cookie", cookie);
  }

  return requestHeaders;
}

// Shared HTTP transport stays intentionally thin: backend business rules remain in Spring Boot.
export async function apiRequest<TResponse, TBody = undefined>(
  pathname: string,
  options: ApiRequestOptions<TBody> = {},
) {
  const { accessToken, body, cookie, headers, method = "GET", query, ...rest } = options;

  let response: Response;

  try {
    response = await fetch(createApiUrl(pathname, query), {
      ...rest,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
      headers: createHeaders(body, accessToken, cookie, headers),
      method,
    });
  } catch (error) {
    throw new ApiError(
      error instanceof Error ? error.message : "Network request failed.",
      0,
    );
  }

  const payload = await safeJson<TResponse | { error?: string; message?: string }>(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message ?? "Request failed."
        : "Request failed.";

    throw new ApiError(message, response.status, {
      error:
        payload && typeof payload === "object" && "error" in payload
          ? payload.error ?? "API_ERROR"
          : "API_ERROR",
      message,
      statusCode: response.status,
    });
  }

  return payload as TResponse;
}
