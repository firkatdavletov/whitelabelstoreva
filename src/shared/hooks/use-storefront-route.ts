"use client";

import { useParams } from "next/navigation";

import { buildStorefrontPath } from "@/shared/config/routing";
import type { Locale } from "@/shared/types/common";

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function useStorefrontRoute() {
  const params = useParams();
  const locale = (getParamValue(params.locale) ?? "en") as Locale;
  const tenantSlug = getParamValue(params.tenant) ?? "urban-bites";

  return {
    href: (pathname = "") =>
      buildStorefrontPath({
        locale,
        pathname,
        tenantSlug,
      }),
    locale,
    tenantSlug,
  };
}
