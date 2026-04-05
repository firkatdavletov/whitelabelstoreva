import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mapOrderDtoToOrder } from "@/entities/order";
import { getCurrentOrderQueryKey } from "@/features/order-tracking/hooks/use-current-order-query";
import { getOrderTrackingQueryKey } from "@/features/order-tracking/hooks/use-order-tracking-query";
import { createMockOrderDto } from "@/features/order-tracking/lib/order-mocks";
import {
  listTrackedOrderIds,
  rememberTrackedOrderId,
} from "@/features/order-tracking/lib/tracked-order-storage";

const mocks = vi.hoisted(() => ({
  cancelOrder: vi.fn(),
}));

vi.mock("@/features/order-tracking/api/cancel-order", () => ({
  cancelOrder: mocks.cancelOrder,
}));

import { useCancelOrderMutation } from "@/features/order-tracking/hooks/use-cancel-order-mutation";

describe("useCancelOrderMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("updates tracking cache and clears current order after cancel", async () => {
    const tenantSlug = "storeva-street";
    const orderId = "order-1";
    const activeOrder = mapOrderDtoToOrder(
      createMockOrderDto({
        orderId,
        stateType: "PREPARING",
      }),
    );
    const canceledOrder = mapOrderDtoToOrder(
      createMockOrderDto({
        orderId,
        stateType: "CANCELED",
      }),
    );
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

    mocks.cancelOrder.mockResolvedValue(canceledOrder);
    rememberTrackedOrderId(tenantSlug, orderId);
    queryClient.setQueryData(
      getOrderTrackingQueryKey(tenantSlug, orderId),
      activeOrder,
    );
    queryClient.setQueryData(getCurrentOrderQueryKey(tenantSlug), activeOrder);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    const { result } = renderHook(
      () => useCancelOrderMutation(orderId, tenantSlug),
      {
        wrapper,
      },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined);
    });

    expect(mocks.cancelOrder).toHaveBeenCalledWith(orderId, undefined);
    expect(
      queryClient.getQueryData(getOrderTrackingQueryKey(tenantSlug, orderId)),
    ).toEqual(canceledOrder);
    expect(
      queryClient.getQueryData(getCurrentOrderQueryKey(tenantSlug)),
    ).toBeNull();
    expect(listTrackedOrderIds(tenantSlug)).not.toContain(orderId);
  });
});
