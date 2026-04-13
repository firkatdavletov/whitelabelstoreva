import { beforeEach, describe, expect, it, vi } from "vitest";

const { resolveTenantMock, searchCatalogProductsMock } = vi.hoisted(() => ({
  resolveTenantMock: vi.fn(),
  searchCatalogProductsMock: vi.fn(),
}));

vi.mock("@/features/menu-catalog/api/search-catalog-products", () => ({
  searchCatalogProducts: searchCatalogProductsMock,
}));

vi.mock("@/processes/bootstrap-tenant/lib/resolve-tenant", () => ({
  resolveTenant: resolveTenantMock,
}));

import { GET, dynamic } from "@/app/api/catalog/search/route";

describe("catalog search route", () => {
  beforeEach(() => {
    searchCatalogProductsMock.mockReset();
    resolveTenantMock.mockReset();
    resolveTenantMock.mockReturnValue({ slug: "aiymbrand" });
  });

  it("is explicitly request-time and disables response caching", async () => {
    searchCatalogProductsMock.mockResolvedValue([
      { id: "product-1", title: "Манго" },
    ]);

    const response = await GET({
      nextUrl: new URL(
        "https://aiymbrand.ru/api/catalog/search?tenant=aiymbrand&query=%D0%BC%D0%B0%D0%BD",
      ),
    } as never);

    expect(dynamic).toBe("force-dynamic");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "no-store, no-cache, max-age=0, must-revalidate",
    );
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("expires")).toBe("0");
    expect(searchCatalogProductsMock).toHaveBeenCalledWith("aiymbrand", "ман");
  });

  it("returns the same no-store headers for empty eligible responses", async () => {
    searchCatalogProductsMock.mockResolvedValue([]);

    const response = await GET({
      nextUrl: new URL(
        "https://aiymbrand.ru/api/catalog/search?tenant=aiymbrand&query=%D0%BC%D0%B0%D0%BD",
      ),
    } as never);

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "no-store, no-cache, max-age=0, must-revalidate",
    );
  });
});
