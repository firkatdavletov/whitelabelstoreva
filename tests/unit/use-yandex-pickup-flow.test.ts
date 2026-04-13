import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  detectYandexLocations: vi.fn(),
  getYandexPickupPoints: vi.fn(),
}));

vi.mock("@/features/delivery-address/api/delivery-address.api", () => ({
  detectYandexLocations: mocks.detectYandexLocations,
  getYandexPickupPoints: mocks.getYandexPickupPoints,
}));

import { useYandexPickupFlow } from "@/features/delivery-address/hooks/use-yandex-pickup-flow";

describe("useYandexPickupFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the first geo variant when the backend returns multiple matches", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
        queries: {
          retry: false,
        },
      },
    });

    mocks.detectYandexLocations.mockResolvedValue({
      variants: [
        { address: "Екатеринбург, Свердловская область", geoId: 54 },
        { address: "Екатеринбург, Краснодарский край", geoId: 77 },
      ],
    });
    mocks.getYandexPickupPoints.mockResolvedValue({
      points: [],
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      );

    const { result } = renderHook(
      () =>
        useYandexPickupFlow({
          enabled: true,
        }),
      { wrapper },
    );

    await act(async () => {
      result.current.submitSearch("Екатеринбург");
    });

    await waitFor(() => {
      expect(result.current.geoId).toBe(54);
    });

    await waitFor(() => {
      expect(mocks.getYandexPickupPoints).toHaveBeenCalledWith(54);
    });

    expect(result.current.searchQuery).toBe(
      "Екатеринбург, Свердловская область",
    );
  });
});
