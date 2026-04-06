import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { mapOrderDtoToOrder } from "@/entities/order";
import { createMockOrderDto } from "@/features/order-tracking/lib/order-mocks";

const mocks = vi.hoisted(() => ({
  cancelMutateAsync: vi.fn(),
  useCancelOrderMutation: vi.fn(),
  useOrderTrackingQuery: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number; number?: string }) => {
      switch (key) {
        case "cart.delivery":
          return "Доставка";
        case "cart.deliveryFree":
          return "Доставка бесплатно";
        case "order.address":
          return "Адрес";
        case "order.deliveryMethod":
          return "Способ получения";
        case "order.items":
          return "Состав";
        case "order.itemsCount":
          return `${options?.count ?? 0} позиций`;
        case "order.orderNumber":
          return `Заказ №${options?.number ?? ""}`;
        case "order.payment":
          return "Оплата";
        case "order.statusUpdated":
          return "Статус обновлён";
        case "order.total":
          return "Итого";
        default:
          return key;
      }
    },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/shared/hooks/use-storefront-route", () => ({
  useStorefrontRoute: () => ({
    locale: "ru",
  }),
}));

vi.mock("@/features/order-tracking/hooks/use-order-tracking-query", () => ({
  useOrderTrackingQuery: mocks.useOrderTrackingQuery,
}));

vi.mock("@/features/order-tracking/hooks/use-cancel-order-mutation", () => ({
  useCancelOrderMutation: mocks.useCancelOrderMutation,
}));

import { OrderStatusCard } from "@/features/order-tracking/ui/order-status-card";

describe("OrderStatusCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useCancelOrderMutation.mockReturnValue({
      isPending: false,
      mutateAsync: mocks.cancelMutateAsync,
    });
    mocks.useOrderTrackingQuery.mockReturnValue({
      data: {
        ...mapOrderDtoToOrder(
          createMockOrderDto({
            orderId: "order-1",
          }),
        ),
        deliveryFeePrice: 200,
      },
      error: null,
      isLoading: false,
      refetch: vi.fn(),
    });
  });

  it("shows delivery price in the order items summary", () => {
    render(
      React.createElement(OrderStatusCard, {
        orderId: "order-1",
        tenantSlug: "storeva-street",
      }),
    );

    expect(screen.getByText("Доставка")).toBeInTheDocument();
    expect(screen.getByText(/200/)).toBeInTheDocument();
  });
});
