import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiRequestMock, getTenantConfigMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  getTenantConfigMock: vi.fn(),
}));

vi.mock("@/shared/api", () => ({
  apiRequest: apiRequestMock,
}));

vi.mock("@/entities/tenant", () => ({
  getTenantConfig: getTenantConfigMock,
}));

vi.mock("@/shared/config/env", () => ({
  env: {
    apiMocksEnabled: false,
  },
}));

import { searchCatalogProducts } from "@/features/menu-catalog/api/search-catalog-products";

describe("searchCatalogProducts", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    getTenantConfigMock.mockReset();
    getTenantConfigMock.mockReturnValue({ currency: "RUB" });
  });

  it("does not forward request-bound auth or device context to public catalog search", async () => {
    apiRequestMock.mockResolvedValue([]);

    const products = await searchCatalogProducts("aiymbrand", "ман");

    expect(products).toEqual([]);
    expect(apiRequestMock).toHaveBeenCalledWith("/v1/catalog/products", {
      accessToken: "",
      cache: "no-store",
      cookie: "",
      installId: "",
      query: {
        query: "ман",
      },
    });
  });
});
