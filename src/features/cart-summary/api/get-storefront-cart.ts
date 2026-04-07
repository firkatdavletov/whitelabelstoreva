import type {
  AddCartItemRequestDto,
  CartResponseDto,
  ChangeCartItemQuantityRequestDto,
  PutCartDeliveryRequestDto,
} from "@/entities/cart/api/cart.dto";
import {
  createCartConfigurationKey,
  mapCartDtoToStorefrontCart,
} from "@/entities/cart";
import type { ProductUnit } from "@/shared/lib/product-quantity";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

export type StorefrontCartItemModifierInput = {
  groupName: string;
  modifierGroupId: string;
  modifierOptionId: string;
  optionName: string;
  price: number;
  quantity: number;
};

export type AddStorefrontCartItemInput = {
  countStep?: number;
  modifiers?: StorefrontCartItemModifierInput[];
  productId: string;
  quantity?: number;
  title?: string;
  unit?: ProductUnit;
  unitPrice?: number;
  variantId?: string | null;
};

type ChangeStorefrontCartItemQuantityInput = {
  itemId: string;
  quantity: number;
};

const mockCartState = new Map<string, CartResponseDto>();

function createMockCartDto(tenantSlug: string): CartResponseDto {
  const deliveryByTenant: Record<string, CartResponseDto["delivery"]> = {
    "storeva-mass": {
      address: {
        apartment: "12",
        city: "Екатеринбург",
        house: "15",
        street: "ул. Ленина",
      },
      deliveryMethod: "COURIER",
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      quote: {
        currency: "RUB",
        deliveryMethod: "COURIER",
        available: true,
        estimatedDays: 0,
        estimatesMinutes: 25,
        message: "от 25 минут",
        pickupPointAddress: null,
        pickupPointName: null,
        priceMinor: 0,
        zoneName: "Центр",
      },
      quoteExpired: false,
      updatedAt: null,
    },
    "storeva-premium": {
      address: {
        apartment: null,
        city: "Екатеринбург",
        house: "7",
        street: "ул. Горького",
      },
      deliveryMethod: "COURIER",
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      quote: {
        currency: "RUB",
        deliveryMethod: "COURIER",
        available: true,
        estimatedDays: 0,
        estimatesMinutes: 35,
        message: "от 35 минут",
        pickupPointAddress: null,
        pickupPointName: null,
        priceMinor: 0,
        zoneName: "Центр",
      },
      quoteExpired: false,
      updatedAt: null,
    },
    "storeva-street": {
      address: {
        apartment: null,
        city: "Екатеринбург",
        house: "24",
        street: "пр. Мира",
      },
      deliveryMethod: "COURIER",
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      quote: {
        currency: "RUB",
        deliveryMethod: "COURIER",
        available: true,
        estimatedDays: 0,
        estimatesMinutes: 25,
        message: "от 25 минут",
        pickupPointAddress: null,
        pickupPointName: null,
        priceMinor: 0,
        zoneName: "Пионерский",
      },
      quoteExpired: false,
      updatedAt: null,
    },
  };

  return {
    delivery:
      deliveryByTenant[tenantSlug] ?? deliveryByTenant["storeva-street"],
    id: `mock-cart-${tenantSlug}`,
    items: [],
    status: "ACTIVE",
    totalPriceMinor: 0,
  };
}

function syncMockCartTotal(cart: CartResponseDto) {
  return {
    ...cart,
    totalPriceMinor: cart.items.reduce(
      (total, item) => total + item.lineTotalMinor,
      0,
    ),
  };
}

function resolveCartLineTitle(input: AddStorefrontCartItemInput) {
  return input.title ?? input.productId;
}

function resolveMockPickupPointMeta(
  pickupPointId: string | null | undefined,
  pickupPointExternalId: string | null | undefined,
) {
  const pickupPointById: Record<string, { address: string; name: string }> = {
    "7ef13ed2-4c3f-4f8d-94c7-e28ea7d5e5d2": {
      address: "Екатеринбург, ул. 8 Марта, 7",
      name: "Storeva Центр",
    },
    "8c7dd8ff-4aeb-4fc2-bf8f-34f3e1c6dcb5": {
      address: "Екатеринбург, ул. Ленина, 14",
      name: "Storeva Парк",
    },
    "pickup-center": {
      address: "Екатеринбург, ул. 8 Марта, 7",
      name: "Storeva Центр",
    },
    "pickup-park": {
      address: "Екатеринбург, ул. Ленина, 14",
      name: "Storeva Парк",
    },
    "yandex-pvz-1": {
      address: "Екатеринбург, ул. Ленина, 14",
      name: "Яндекс Маркет на Ленина",
    },
    "yandex-pvz-2": {
      address: "Екатеринбург, ул. 8 Марта, 7",
      name: "ПВЗ Boxberry / Яндекс",
    },
    "yandex-pvz-3": {
      address: "Екатеринбург, ул. Малышева, 42",
      name: "Яндекс Маркет на Малышева",
    },
  };

  const lookupId = pickupPointExternalId ?? pickupPointId;

  if (!lookupId) {
    return {
      address: null,
      name: null,
    };
  }

  return (
    pickupPointById[lookupId] ?? {
      address: null,
      name: null,
    }
  );
}

function getMockCart(tenantSlug: string) {
  const existingCart = mockCartState.get(tenantSlug);

  if (existingCart) {
    return existingCart;
  }

  const nextCart = createMockCartDto(tenantSlug);
  mockCartState.set(tenantSlug, nextCart);

  return nextCart;
}

function setMockCart(tenantSlug: string, cart: CartResponseDto) {
  const nextCart = syncMockCartTotal(cart);
  mockCartState.set(tenantSlug, nextCart);

  return mapCartDtoToStorefrontCart(nextCart);
}

export async function getStorefrontCart(tenantSlug: string) {
  if (env.apiMocksEnabled) {
    return mapCartDtoToStorefrontCart(getMockCart(tenantSlug));
  }

  const dto = await apiRequest<CartResponseDto>("/v1/cart");

  return mapCartDtoToStorefrontCart(dto);
}

export async function addStorefrontCartItem(
  input: AddStorefrontCartItemInput,
  tenantSlug: string,
) {
  if (env.apiMocksEnabled) {
    const cart = getMockCart(tenantSlug);
    const quantity = input.quantity ?? 1;
    const configurationKey = createCartConfigurationKey(input);
    const modifiers = input.modifiers ?? [];
    const modifierTotalMinor = modifiers.reduce(
      (total, modifier) =>
        total + Math.round(modifier.price * 100) * modifier.quantity,
      0,
    );
    const unitPriceMinor = Math.round((input.unitPrice ?? 0) * 100);
    const unitTotalMinor = unitPriceMinor + modifierTotalMinor;
    const existingItem = cart.items.find(
      (item) =>
        item.id === `mock-item-${configurationKey}` &&
        item.productId === input.productId,
    );

    if (existingItem) {
      const nextQuantity = existingItem.quantity + quantity;
      const lineTotalMinor =
        (existingItem.unitPriceMinor + existingItem.modifiersTotalMinor) *
        nextQuantity;

      return setMockCart(tenantSlug, {
        ...cart,
        items: cart.items.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                lineTotalMinor,
                priceMinor: lineTotalMinor,
                quantity: nextQuantity,
              }
            : item,
        ),
      });
    }

    return setMockCart(tenantSlug, {
      ...cart,
      items: [
        ...cart.items,
        {
          countStep: input.countStep ?? 1,
          id: `mock-item-${configurationKey}`,
          lineTotalMinor: unitTotalMinor * quantity,
          modifiers: modifiers.map((modifier) => ({
            applicationScope: "PER_ITEM",
            groupCode: modifier.modifierGroupId,
            groupName: modifier.groupName,
            modifierGroupId: modifier.modifierGroupId,
            modifierOptionId: modifier.modifierOptionId,
            optionCode: modifier.modifierOptionId,
            optionName: modifier.optionName,
            priceMinor: Math.round(modifier.price * 100),
            quantity: modifier.quantity,
          })),
          modifiersTotalMinor: modifierTotalMinor,
          priceMinor: unitTotalMinor * quantity,
          productId: input.productId,
          quantity,
          title: resolveCartLineTitle(input),
          unit: input.unit ?? "PIECE",
          unitPriceMinor,
          variantId: input.variantId ?? null,
        },
      ],
    });
  }

  const dto = await apiRequest<CartResponseDto, AddCartItemRequestDto>(
    "/v1/cart/items",
    {
      body: {
        modifiers: (input.modifiers ?? []).map((modifier) => ({
          modifierGroupId: modifier.modifierGroupId,
          modifierOptionId: modifier.modifierOptionId,
          quantity: modifier.quantity,
        })),
        productId: input.productId,
        quantity: input.quantity ?? 1,
        variantId: input.variantId ?? null,
      },
      method: "POST",
    },
  );

  return mapCartDtoToStorefrontCart(dto);
}

export async function changeStorefrontCartItemQuantity(
  input: ChangeStorefrontCartItemQuantityInput,
  tenantSlug: string,
) {
  if (env.apiMocksEnabled) {
    const cart = getMockCart(tenantSlug);

    return setMockCart(tenantSlug, {
      ...cart,
      items: cart.items.map((item) => {
        if (item.id !== input.itemId) {
          return item;
        }

        const unitPriceMinor = item.unitPriceMinor + item.modifiersTotalMinor;

        return {
          ...item,
          lineTotalMinor: unitPriceMinor * input.quantity,
          priceMinor: unitPriceMinor * input.quantity,
          quantity: input.quantity,
        };
      }),
    });
  }

  const dto = await apiRequest<
    CartResponseDto,
    ChangeCartItemQuantityRequestDto
  >(`/v1/cart/items/${input.itemId}`, {
    body: {
      quantity: input.quantity,
    },
    method: "PATCH",
  });

  return mapCartDtoToStorefrontCart(dto);
}

export async function removeStorefrontCartItem(
  itemId: string,
  tenantSlug: string,
) {
  if (env.apiMocksEnabled) {
    const cart = getMockCart(tenantSlug);

    return setMockCart(tenantSlug, {
      ...cart,
      items: cart.items.filter((item) => item.id !== itemId),
    });
  }

  const dto = await apiRequest<CartResponseDto>(`/v1/cart/items/${itemId}`, {
    method: "DELETE",
  });

  return mapCartDtoToStorefrontCart(dto);
}

export async function clearStorefrontCart(tenantSlug: string) {
  if (env.apiMocksEnabled) {
    const cart = getMockCart(tenantSlug);

    return setMockCart(tenantSlug, {
      ...cart,
      items: [],
    });
  }

  const dto = await apiRequest<CartResponseDto>("/v1/cart", {
    method: "DELETE",
  });

  return mapCartDtoToStorefrontCart(dto);
}

export async function updateStorefrontCartDelivery(
  input: PutCartDeliveryRequestDto,
  tenantSlug: string,
) {
  if (env.apiMocksEnabled) {
    const cart = getMockCart(tenantSlug);
    const pickupPointMeta = resolveMockPickupPointMeta(
      input.pickupPointId,
      input.pickupPointExternalId,
    );

    return setMockCart(tenantSlug, {
      ...cart,
      delivery:
        input.deliveryMethod === "COURIER"
          ? {
              address: input.address ?? null,
              deliveryMethod: input.deliveryMethod,
              pickupPointAddress: null,
              pickupPointExternalId: null,
              pickupPointId: null,
              pickupPointName: null,
              quote: {
                available: true,
                currency: "RUB",
                deliveryMethod: "COURIER",
                estimatedDays: 0,
                estimatesMinutes: 25,
                message: "от 25 минут",
                pickupPointAddress: null,
                pickupPointName: null,
                priceMinor: 0,
                zoneName: input.address?.city ?? "Центр",
              },
              quoteExpired: false,
              updatedAt: new Date().toISOString(),
            }
          : {
              address: null,
              deliveryMethod: input.deliveryMethod,
              pickupPointAddress: pickupPointMeta.address,
              pickupPointExternalId: input.pickupPointExternalId ?? null,
              pickupPointId: input.pickupPointId ?? null,
              pickupPointName: pickupPointMeta.name,
              quote: null,
              quoteExpired: false,
              updatedAt: new Date().toISOString(),
            },
    });
  }

  await apiRequest("/v1/cart/delivery", {
    body: input,
    method: "PUT",
  });

  return getStorefrontCart(tenantSlug);
}
