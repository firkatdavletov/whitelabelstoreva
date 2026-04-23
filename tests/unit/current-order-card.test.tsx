import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Order } from "@/entities/order";

const { useCurrentOrderQueryMock, useTenantThemeMock } = vi.hoisted(() => ({
  useCurrentOrderQueryMock: vi.fn(),
  useTenantThemeMock: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: (props: {
    children: React.ReactNode;
    className?: string;
    href: string;
  }) =>
    React.createElement(
      "a",
      {
        className: props.className,
        href: props.href,
      },
      props.children,
    ),
}));

vi.mock("@/features/order-tracking/hooks/use-current-order-query", () => ({
  useCurrentOrderQuery: useCurrentOrderQueryMock,
}));

vi.mock("@/features/tenant-theme", () => ({
  useTenantTheme: useTenantThemeMock,
}));

vi.mock("@/shared/hooks/use-storefront-route", () => ({
  useStorefrontRoute: () => ({
    href: (pathname = "") => pathname,
    locale: "ru",
    tenantSlug: "aiymbrand",
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "order.orderNumber") {
        return `Заказ №${params?.number as string}`;
      }

      if (key === "order.total") {
        return "Итого";
      }

      if (key === "order.itemsCount") {
        return `${params?.count as number} позиции`;
      }

      return key;
    },
  }),
}));

import { CurrentOrderCard } from "@/features/order-tracking/ui/current-order-card";

const order: Order = {
  createdAt: "2026-04-23T14:29:31.100Z",
  currency: "RUB",
  customerEmail: "guest@example.com",
  customerName: "Alex Ivanov",
  customerPhone: "+7 (999) 123-45-67",
  deliveryAddress: "Lenina Ave, дом 15, кв. 12, Yekaterinburg",
  deliveryFeePrice: 0,
  deliveryMethod: "COURIER",
  deliveryMethodName: "Courier delivery",
  etaMinutes: 24,
  id: "mock-current-order-aiymbrand",
  isActive: true,
  isCancellable: false,
  isFinal: false,
  isVisibleToCustomer: true,
  items: [],
  itemsCount: 3,
  orderNumber: "WL-MBRAND",
  paymentMethodName: "Online card",
  pickupPointAddress: null,
  pickupPointName: null,
  stateColor: "#d65c26",
  stateIcon: null,
  stateType: "OUT_FOR_DELIVERY",
  statusChangedAt: "2026-04-23T14:57:31.100Z",
  statusCode: "OUT_FOR_DELIVERY",
  statusLabel: "Out for delivery",
  subtotalPrice: 17,
  timeline: [
    {
      code: "CREATED",
      id: "history-0",
      isCompleted: true,
      isCurrent: false,
      isIssue: false,
      label: "Заказ создан",
      timestamp: "2026-04-23T14:29:31.100Z",
    },
    {
      code: "OUT_FOR_DELIVERY",
      id: "history-1",
      isCompleted: false,
      isCurrent: true,
      isIssue: false,
      label: "Передан в доставку",
      timestamp: "2026-04-23T14:57:31.100Z",
    },
    {
      code: "COMPLETED",
      id: "history-2",
      isCompleted: false,
      isCurrent: false,
      isIssue: false,
      label: "Заказ завершён",
      timestamp: null,
    },
  ],
  totalPrice: 18.5,
  trackingMeta: {
    courierTrackingAvailable: false,
    etaSource: "backend",
    timelineSource: "backend",
  },
  updatedAt: "2026-04-23T15:05:31.100Z",
};

describe("CurrentOrderCard", () => {
  it("uses the minimal fashion layout for aiymbrand and hides the timeline list", () => {
    useCurrentOrderQueryMock.mockReturnValue({ data: order });
    useTenantThemeMock.mockReturnValue({
      home: {
        currentOrderCard: "current-order-fashion",
      },
    });

    render(React.createElement(CurrentOrderCard, { initialData: order }));

    const heading = screen.getByRole("heading", { name: "Заказ №WL-MBRAND" });

    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain("text-2xl");
    expect(screen.getByText("Передан в доставку")).toBeInTheDocument();
    expect(screen.getByText("Итого")).toBeInTheDocument();
    expect(screen.queryByText("Заказ создан")).not.toBeInTheDocument();
    expect(screen.queryByText("Заказ завершён")).not.toBeInTheDocument();
  });
});
