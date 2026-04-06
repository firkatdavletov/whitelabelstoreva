import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useCheckoutMutation: vi.fn(),
  useCheckoutOptionsQuery: vi.fn(),
  useStorefrontCartQuery: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: (props: { children: React.ReactNode; href: string }) =>
    React.createElement("a", { href: props.href }, props.children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      switch (key) {
        case "checkout.title":
          return "Оформление заказа";
        case "checkout.deliveryLocation":
          return "Куда доставить";
        case "checkout.apartment":
          return "Квартира";
        case "checkout.entrance":
          return "Подъезд";
        case "checkout.floor":
          return "Этаж";
        case "checkout.intercom":
          return "Домофон";
        case "checkout.paymentMethod":
          return "Способ оплаты";
        case "checkout.paymentMethodOffline":
          return "При получении";
        case "checkout.privateHouse":
          return "Частный дом";
        case "checkout.comment":
          return "Комментарий курьеру";
        case "checkout.submit":
          return "Оформить заказ";
        default:
          return key;
      }
    },
  }),
}));

vi.mock("@/shared/hooks/use-storefront-route", () => ({
  useStorefrontRoute: () => ({
    href: (pathname = "") => pathname,
    tenantSlug: "storeva-street",
  }),
}));

vi.mock("@/features/cart-summary/hooks/use-storefront-cart-query", () => ({
  useStorefrontCartQuery: mocks.useStorefrontCartQuery,
}));

vi.mock("@/features/checkout-form/hooks/use-checkout-options-query", () => ({
  useCheckoutOptionsQuery: mocks.useCheckoutOptionsQuery,
}));

vi.mock("@/features/checkout-form/hooks/use-checkout-mutation", () => ({
  useCheckoutMutation: mocks.useCheckoutMutation,
}));

vi.mock("@/features/order-tracking/lib/tracked-order-storage", () => ({
  rememberTrackedOrderId: vi.fn(),
}));

import { CheckoutForm } from "@/features/checkout-form/ui/checkout-form";

describe("CheckoutForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useStorefrontCartQuery.mockReturnValue({
      data: {
        delivery: {
          address: {
            apartment: null,
            city: "Екатеринбург",
            comment: null,
            country: "Россия",
            entrance: null,
            floor: null,
            house: "15",
            intercom: null,
            postalCode: "620014",
            region: "Свердловская область",
            street: "ул. Ленина",
          },
          deliveryMethod: "COURIER",
          pickupPointAddress: null,
          pickupPointId: null,
          pickupPointName: null,
          quote: null,
          quoteExpired: false,
        },
        id: "cart-1",
        items: [
          {
            countStep: 1,
            id: "item-1",
            lineTotal: 12.9,
            modifierNames: [],
            modifiers: [],
            productId: "prod-1",
            quantity: 1,
            title: "Бургер",
            unit: "PIECE",
            variantId: null,
          },
        ],
        itemsCount: 1,
        totalPrice: 12.9,
      },
      isLoading: false,
    });
    mocks.useCheckoutOptionsQuery.mockReturnValue({
      data: {
        options: [
          {
            code: "COURIER",
            name: "Доставка",
            paymentMethods: [
              {
                code: "CARD_ON_DELIVERY",
                description: null,
                isActive: true,
                isOnline: false,
                name: "Картой при получении",
              },
            ],
            requiresAddress: true,
            requiresPickupPoint: false,
          },
        ],
      },
      isError: false,
      isLoading: false,
      refetch: vi.fn(),
    });
    mocks.useCheckoutMutation.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn(),
    });
  });

  it("hides apartment metadata fields when private house is selected", async () => {
    const user = userEvent.setup();

    render(React.createElement(CheckoutForm, { isAuthorized: true }));

    expect(screen.getByText("Квартира")).toBeInTheDocument();
    expect(screen.getByText("Подъезд")).toBeInTheDocument();
    expect(screen.getByText("Этаж")).toBeInTheDocument();
    expect(screen.getByText("Домофон")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Частный дом" }));

    expect(screen.queryByText("Квартира")).not.toBeInTheDocument();
    expect(screen.queryByText("Подъезд")).not.toBeInTheDocument();
    expect(screen.queryByText("Этаж")).not.toBeInTheDocument();
    expect(screen.queryByText("Домофон")).not.toBeInTheDocument();
  });

  it("renders checkout inputs without placeholders", () => {
    render(React.createElement(CheckoutForm, { isAuthorized: false }));

    expect(screen.getByLabelText("checkout.fullName")).not.toHaveAttribute(
      "placeholder",
    );
    expect(screen.getByLabelText("checkout.phone")).not.toHaveAttribute(
      "placeholder",
    );
    expect(screen.getByLabelText("Квартира")).not.toHaveAttribute(
      "placeholder",
    );
    expect(screen.getByLabelText("Подъезд")).not.toHaveAttribute("placeholder");
    expect(screen.getByLabelText("Домофон")).not.toHaveAttribute("placeholder");
    expect(screen.getByLabelText("Этаж")).not.toHaveAttribute("placeholder");
    expect(screen.getByLabelText("Комментарий курьеру")).not.toHaveAttribute(
      "placeholder",
    );
  });
});
