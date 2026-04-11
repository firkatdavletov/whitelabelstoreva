import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  routerPush: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
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
    push: mocks.routerPush,
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
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
          return "Комментарий к заказу";
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

import {
  getRememberedGuestCheckoutContact,
  rememberGuestCheckoutContact,
} from "@/features/checkout-form/lib/guest-checkout-contact-storage";
import { CheckoutForm } from "@/features/checkout-form/ui/checkout-form";

describe("CheckoutForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();

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

  it("hides address metadata fields for custom address delivery", () => {
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
            house: "10",
            intercom: null,
            postalCode: "620014",
            region: "Свердловская область",
            street: "ул. Радищева",
          },
          deliveryMethod: "CUSTOM_DELIVERY_ADDRESS",
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
            code: "CUSTOM_DELIVERY_ADDRESS",
            name: "Доставка по адресу",
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

    render(React.createElement(CheckoutForm, { isAuthorized: true }));

    expect(screen.queryByText("Квартира")).not.toBeInTheDocument();
    expect(screen.queryByText("Подъезд")).not.toBeInTheDocument();
    expect(screen.queryByText("Этаж")).not.toBeInTheDocument();
    expect(screen.queryByText("Домофон")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Частный дом" }),
    ).not.toBeInTheDocument();
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
    expect(screen.getByLabelText("Комментарий к заказу")).not.toHaveAttribute(
      "placeholder",
    );
  });

  it("restores guest contact fields from localStorage", async () => {
    rememberGuestCheckoutContact("storeva-street", {
      fullName: "Алексей Иванов",
      phone: "+7 (999) 123-45-67",
    });

    render(React.createElement(CheckoutForm, { isAuthorized: false }));

    await waitFor(() => {
      expect(screen.getByLabelText("checkout.fullName")).toHaveValue(
        "Алексей Иванов",
      );
      expect(screen.getByLabelText("checkout.phone")).toHaveValue(
        "+7 (999) 123-45-67",
      );
    });
  });

  it("saves guest contact fields after successful checkout", async () => {
    const user = userEvent.setup();

    mocks.useCheckoutMutation.mockReturnValue({
      isPending: false,
      mutateAsync: vi.fn().mockResolvedValue({
        id: "order-1",
        orderNumber: "1001",
      }),
    });

    render(React.createElement(CheckoutForm, { isAuthorized: false }));

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Оформить заказ" }),
      ).toBeEnabled();
    });

    await user.type(
      screen.getByLabelText("checkout.fullName"),
      "Алексей Иванов",
    );
    await user.type(
      screen.getByLabelText("checkout.phone"),
      "+7 (999) 123-45-67",
    );
    await user.type(screen.getByLabelText("Квартира"), "12");
    await user.click(screen.getByRole("button", { name: "Оформить заказ" }));

    await waitFor(() => {
      expect(getRememberedGuestCheckoutContact("storeva-street")).toEqual({
        fullName: "Алексей Иванов",
        phone: "+7 (999) 123-45-67",
      });
    });
  });
});
