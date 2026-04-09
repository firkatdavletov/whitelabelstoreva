import { env } from "@/shared/config/env";
import type { ApiQueryParams } from "@/shared/types/api";

function createApiBaseUrl(rawBaseUrl: string) {
  const baseUrl = new URL(rawBaseUrl);
  const normalizedPathname = baseUrl.pathname.replace(/\/+$/, "");

  baseUrl.pathname = normalizedPathname.endsWith("/api")
    ? `${normalizedPathname}/`
    : `${normalizedPathname || ""}/api/`;

  return baseUrl.toString();
}

export function createApiUrl(pathname: string, query?: ApiQueryParams) {
  const url = new URL(
    pathname.replace(/^\//, ""),
    createApiBaseUrl(env.NEXT_PUBLIC_API_BASE_URL),
  );

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}
