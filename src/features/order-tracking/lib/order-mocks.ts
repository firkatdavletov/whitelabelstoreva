import type { OrderDto, OrderStateType } from "@/entities/order";

type CreateMockOrderDtoOptions = {
  orderId: string;
  orderNumber?: string;
  stateType?: OrderStateType;
};

const MOCK_ORDER_FLOW: OrderStateType[] = [
  "CREATED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
];

const MOCK_ORDER_STATUS_CONFIG: Record<
  OrderStateType,
  {
    code: string;
    isCancellable: boolean;
    isFinal: boolean;
    name: string;
  }
> = {
  AWAITING_CONFIRMATION: {
    code: "AWAITING_CONFIRMATION",
    isCancellable: true,
    isFinal: false,
    name: "Awaiting confirmation",
  },
  CANCELED: {
    code: "CANCELED",
    isCancellable: false,
    isFinal: true,
    name: "Canceled",
  },
  COMPLETED: {
    code: "COMPLETED",
    isCancellable: false,
    isFinal: true,
    name: "Completed",
  },
  CONFIRMED: {
    code: "CONFIRMED",
    isCancellable: true,
    isFinal: false,
    name: "Confirmed",
  },
  CREATED: {
    code: "CREATED",
    isCancellable: true,
    isFinal: false,
    name: "Created",
  },
  ON_HOLD: {
    code: "ON_HOLD",
    isCancellable: true,
    isFinal: false,
    name: "On hold",
  },
  OUT_FOR_DELIVERY: {
    code: "OUT_FOR_DELIVERY",
    isCancellable: false,
    isFinal: false,
    name: "Out for delivery",
  },
  PREPARING: {
    code: "PREPARING",
    isCancellable: true,
    isFinal: false,
    name: "Preparing",
  },
  READY_FOR_PICKUP: {
    code: "READY_FOR_PICKUP",
    isCancellable: false,
    isFinal: false,
    name: "Ready for pickup",
  },
};

function resolveMockHistoryStates(stateType: OrderStateType): OrderStateType[] {
  if (stateType === "CANCELED") {
    return ["CREATED", "AWAITING_CONFIRMATION", "CANCELED"];
  }

  if (stateType === "ON_HOLD") {
    return ["CREATED", "AWAITING_CONFIRMATION", "CONFIRMED", "ON_HOLD"];
  }

  const currentIndex = MOCK_ORDER_FLOW.indexOf(stateType);

  if (currentIndex === -1) {
    return [...MOCK_ORDER_FLOW.slice(0, 4), stateType];
  }

  return MOCK_ORDER_FLOW.slice(0, currentIndex + 1);
}

export function createMockOrderDto({
  orderId,
  orderNumber = `WL-${orderId.slice(-6).toUpperCase()}`,
  stateType = "OUT_FOR_DELIVERY",
}: CreateMockOrderDtoOptions): OrderDto {
  const currentStatus = MOCK_ORDER_STATUS_CONFIG[stateType];
  const now = new Date();
  const createdAt = new Date(now.getTime() - 36 * 60 * 1000).toISOString();
  const statusChangedAt = new Date(now.getTime() - 8 * 60 * 1000).toISOString();
  const statusHistoryStates = resolveMockHistoryStates(stateType);
  const statusHistory = statusHistoryStates.map((code, index) => {
    const entryDate =
      index === 0
        ? createdAt
        : index === statusHistoryStates.length - 1
          ? statusChangedAt
          : new Date(
              now.getTime() - (30 - index * 6) * 60 * 1000,
            ).toISOString();

    return {
      code,
      name: MOCK_ORDER_STATUS_CONFIG[code]?.name ?? code,
      timestamp: entryDate,
    };
  });

  return {
    comment: "Leave the order at the door.",
    createdAt,
    customerEmail: "guest@example.com",
    customerName: "Alex Ivanov",
    customerPhone: "+7 (999) 123-45-67",
    customerType: "GUEST",
    delivery: {
      address: {
        apartment: "12",
        city: "Yekaterinburg",
        comment: null,
        country: "Russia",
        entrance: null,
        floor: null,
        house: "15",
        intercom: null,
        latitude: 56.838011,
        longitude: 60.597465,
        postalCode: null,
        region: "Sverdlovsk Oblast",
        street: "Lenina Ave",
      },
      currency: "RUB",
      estimatedDays: 0,
      estimatesMinutes: stateType === "COMPLETED" ? 0 : 24,
      method: "COURIER",
      methodName: "Courier delivery",
      pickupPointAddress: null,
      pickupPointExternalId: null,
      pickupPointId: null,
      pickupPointName: null,
      priceMinor: 150,
      zoneCode: "CENTER",
      zoneName: "City center",
    },
    deliveryFeeMinor: 150,
    deliveryMethod: "COURIER",
    guestInstallId: "mock-installation-id",
    id: orderId,
    items: [
      {
        id: `${orderId}-item-1`,
        modifiers: [
          {
            applicationScope: "PER_ITEM",
            groupCode: "sauce",
            groupName: "Sauce",
            modifierGroupId: "mock-mod-group-1",
            modifierOptionId: "mock-mod-option-1",
            optionCode: "bbq",
            optionName: "BBQ sauce",
            priceMinor: 0,
            quantity: 1,
          },
        ],
        modifiersTotalMinor: 0,
        priceMinor: 690,
        productId: "mock-product-1",
        quantity: 2,
        sku: "BRG-001",
        title: "Smash burger",
        totalMinor: 1380,
        unit: "PIECE",
        variantId: null,
      },
      {
        id: `${orderId}-item-2`,
        modifiers: [],
        modifiersTotalMinor: 0,
        priceMinor: 320,
        productId: "mock-product-2",
        quantity: 1,
        sku: "LEM-001",
        title: "Lemonade",
        totalMinor: 320,
        unit: "PIECE",
        variantId: null,
      },
    ],
    orderNumber,
    payment: {
      code: "CARD_ONLINE",
      name: "Online card",
    },
    statusHistory,
    stateType,
    status: currentStatus.code,
    statusChangedAt,
    statusName: currentStatus.name,
    subtotalMinor: 1700,
    totalMinor: 1850,
    updatedAt: now.toISOString(),
    userId: null,
    currentStatus: {
      code: currentStatus.code,
      color: stateType === "COMPLETED" ? "#0f766e" : "#d65c26",
      icon: null,
      id: `mock-status-${stateType.toLowerCase()}`,
      isCancellable: currentStatus.isCancellable,
      isFinal: currentStatus.isFinal,
      name: currentStatus.name,
      stateType,
      visibleToCustomer: true,
    },
  };
}
