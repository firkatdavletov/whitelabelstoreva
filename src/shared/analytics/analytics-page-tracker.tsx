"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { trackPageView } from "@/shared/analytics/analytics";

export function AnalyticsPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedInitialPage = useRef(false);
  const serializedSearchParams = searchParams.toString();
  const path = serializedSearchParams
    ? `${pathname}?${serializedSearchParams}`
    : pathname;

  useEffect(() => {
    if (!path) {
      return;
    }

    if (!hasTrackedInitialPage.current) {
      hasTrackedInitialPage.current = true;
      trackPageView(path, { includeYandex: false });
      return;
    }

    trackPageView(path);
  }, [path]);

  return null;
}
