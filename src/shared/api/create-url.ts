import { env } from "@/shared/config/env";
import type { ApiQueryParams } from "@/shared/types/api";

export function createApiUrl(pathname: string, query?: ApiQueryParams) {
  const url = new URL(pathname.replace(/^\//, ""), `${env.NEXT_PUBLIC_API_BASE_URL}/`);

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
