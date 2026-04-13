import { describe, expect, it } from "vitest";

import {
  buildStorefrontPath,
  getRequestHostnameFromHeaders,
  getTenantPrimaryHostname,
  normalizeHostname,
  resolveTenantSlugByHostname,
} from "@/shared/config/routing";

describe("storefront routing", () => {
  it("rewrites branded tenant paths without the tenant slug", () => {
    expect(
      buildStorefrontPath({
        hostname: "aiymbrand.ru",
        locale: "ru",
        pathname: "/checkout",
        tenantSlug: "aiymbrand",
      }),
    ).toBe("/ru/checkout");
  });

  it("keeps the tenant slug on non-branded hosts", () => {
    expect(
      buildStorefrontPath({
        hostname: "localhost:3000",
        locale: "ru",
        pathname: "/checkout",
        tenantSlug: "aiymbrand",
      }),
    ).toBe("/aiymbrand/ru/checkout");
  });

  it("resolves tenant slugs from branded hosts", () => {
    expect(resolveTenantSlugByHostname("aiymbrand.ru")).toBe("aiymbrand");
    expect(resolveTenantSlugByHostname("www.aiymbrand.ru")).toBe("aiymbrand");
    expect(resolveTenantSlugByHostname("localhost:3000")).toBeNull();
  });

  it("normalizes forwarded host headers", () => {
    const requestHeaders = new Headers({
      host: "ignored.example",
      "x-forwarded-host": "AIYMBRAND.RU:443",
    });

    expect(getRequestHostnameFromHeaders(requestHeaders)).toBe("aiymbrand.ru");
    expect(normalizeHostname("www.aiymbrand.ru:443")).toBe("www.aiymbrand.ru");
    expect(getTenantPrimaryHostname("aiymbrand")).toBe("aiymbrand.ru");
  });
});
