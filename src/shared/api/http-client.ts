import { ApiError } from "@/shared/api/api-error";
import { createApiUrl } from "@/shared/api/create-url";
import { getClientInstallId } from "@/shared/api/install-id";
import { safeJson } from "@/shared/lib/safe-json";
import type { ApiMethod, ApiQueryParams } from "@/shared/types/api";

type ApiRequestOptions<TBody> = Omit<RequestInit, "body" | "headers" | "method"> & {
  accessToken?: string;
  body?: TBody;
  cookie?: string;
  headers?: HeadersInit;
  installId?: string;
  method?: ApiMethod;
  query?: ApiQueryParams;
};

function createHeaders(
  body: unknown,
  accessToken?: string,
  cookie?: string,
  installId?: string,
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

  const resolvedInstallId = installId ?? (!accessToken ? getClientInstallId() : undefined);

  if (resolvedInstallId) {
    requestHeaders.set("X-Install-Id", resolvedInstallId);
  }

  if (cookie) {
    requestHeaders.set("Cookie", cookie);
  }

  return requestHeaders;
}

function logApiFailure({
  url,
  method,
  statusCode,
  message,
  hasAccessToken,
  hasCookie,
  hasInstallId,
}: {
  url: string;
  method: ApiMethod;
  statusCode: number;
  message: string;
  hasAccessToken: boolean;
  hasCookie: boolean;
  hasInstallId: boolean;
}) {
  console.error("[apiRequest] request failed", {
    hasAccessToken,
    hasCookie,
    hasInstallId,
    message,
    method,
    runtime: typeof window === "undefined" ? "server" : "client",
    statusCode,
    url,
  });
}

// Shared HTTP transport stays intentionally thin: backend business rules remain in Spring Boot.
export async function apiRequest<TResponse, TBody = undefined>(
  pathname: string,
  options: ApiRequestOptions<TBody> = {},
) {
  const {
    accessToken,
    body,
    cookie,
    credentials,
    headers,
    installId,
    method = "GET",
    query,
    ...rest
  } = options;

  const resolvedCredentials = credentials ?? "same-origin";
  const requestUrl = createApiUrl(pathname, query);
  const hasAccessToken = Boolean(accessToken);
  const hasCookie = Boolean(cookie);
  const hasInstallId = Boolean(installId);

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      ...rest,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: resolvedCredentials,
      headers: createHeaders(body, accessToken, cookie, installId, headers),
      method,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed.";

    logApiFailure({
      hasAccessToken,
      hasCookie,
      hasInstallId,
      message,
      method,
      statusCode: 0,
      url: requestUrl,
    });

    throw new ApiError(
      message,
      0,
    );
  }

  const payload = await safeJson<TResponse | { error?: string; message?: string }>(response);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message ?? "Request failed."
        : "Request failed.";

    logApiFailure({
      hasAccessToken,
      hasCookie,
      hasInstallId,
      message,
      method,
      statusCode: response.status,
      url: requestUrl,
    });

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
