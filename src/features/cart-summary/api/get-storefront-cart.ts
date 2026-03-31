import type {
  AddCartItemRequestDto,
  CartResponseDto,
  ChangeCartItemQuantityRequestDto,
} from "@/entities/cart/api/cart.dto";
import { mapCartDtoToStorefrontCart } from "@/entities/cart";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

type AddStorefrontCartItemInput = {
  productId: string;
  quantity?: number;
  title?: string;
  unitPrice?: number;
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
      pickupPointName: null,
      quote: {
        available: true,
        estimatedDays: 0,
        message: "от 25 минут",
        pickupPointAddress: null,
        pickupPointName: null,
        zoneName: "Центр",
      },
      quoteExpired: false,
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
      pickupPointName: null,
      quote: {
        available: true,
        estimatedDays: 0,
        message: "от 35 минут",
        pickupPointAddress: null,
        pickupPointName: null,
        zoneName: "Центр",
      },
      quoteExpired: false,
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
      pickupPointName: null,
      quote: {
        available: true,
        estimatedDays: 0,
        message: "от 25 минут",
        pickupPointAddress: null,
        pickupPointName: null,
        zoneName: "Пионерский",
      },
      quoteExpired: false,
    },
  };

  return {
    delivery:
      deliveryByTenant[tenantSlug] ?? deliveryByTenant["storeva-street"],
    id: `mock-cart-${tenantSlug}`,
    items: [],
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
    const unitPriceMinor = Math.round((input.unitPrice ?? 0) * 100);
    const existingItem = cart.items.find(
      (item) => item.productId === input.productId,
    );

    if (existingItem) {
      return setMockCart(tenantSlug, {
        ...cart,
        items: cart.items.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                lineTotalMinor: unitPriceMinor * (item.quantity + quantity),
                quantity: item.quantity + quantity,
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
          id: `mock-item-${input.productId}`,
          lineTotalMinor: unitPriceMinor * quantity,
          productId: input.productId,
          quantity,
          title: input.title ?? input.productId,
        },
      ],
    });
  }

  const dto = await apiRequest<CartResponseDto, AddCartItemRequestDto>(
    "/v1/cart/items",
    {
      body: {
        modifiers: [],
        productId: input.productId,
        quantity: input.quantity ?? 1,
        variantId: null,
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

        const unitPriceMinor =
          item.quantity > 0
            ? Math.round(item.lineTotalMinor / item.quantity)
            : 0;

        return {
          ...item,
          lineTotalMinor: unitPriceMinor * input.quantity,
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
