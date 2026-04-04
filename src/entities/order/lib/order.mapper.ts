import type {
  OrderDeliveryMethod,
  OrderDto,
  OrderStateType,
} from "@/entities/order/api/order.dto";
import type { Order } from "@/entities/order/model/order.types";

const DEFAULT_ORDER_FLOW: OrderStateType[] = [
  "CREATED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "PREPARING",
  "COMPLETED",
];

const DELIVERY_ORDER_FLOWS: Record<OrderDeliveryMethod, OrderStateType[]> = {
  COURIER: [
    "CREATED",
    "AWAITING_CONFIRMATION",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
  ],
  PICKUP: [
    "CREATED",
    "AWAITING_CONFIRMATION",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "COMPLETED",
  ],
  YANDEX_PICKUP_POINT: [
    "CREATED",
    "AWAITING_CONFIRMATION",
    "CONFIRMED",
    "PREPARING",
    "READY_FOR_PICKUP",
    "COMPLETED",
  ],
};

function buildAddressLine(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => Boolean(part?.trim())).join(", ");
}

function formatDeliveryAddress(dto: OrderDto) {
  if (dto.delivery.address) {
    const primaryLine = buildAddressLine([
      dto.delivery.address.street,
      dto.delivery.address.house,
    ]);
    const secondaryLine = buildAddressLine([
      dto.delivery.address.apartment ? `#${dto.delivery.address.apartment}` : null,
      dto.delivery.address.city,
      dto.delivery.address.region,
    ]);

    return buildAddressLine([primaryLine, secondaryLine]) || null;
  }

  return null;
}

function insertAfter(
  flow: OrderStateType[],
  anchor: OrderStateType,
  nextState: OrderStateType,
): OrderStateType[] {
  if (flow.includes(nextState)) {
    return flow;
  }

  const anchorIndex = flow.indexOf(anchor);

  if (anchorIndex === -1) {
    return [...flow, nextState];
  }

  return [
    ...flow.slice(0, anchorIndex + 1),
    nextState,
    ...flow.slice(anchorIndex + 1),
  ];
}

function resolveTimelineFlow(dto: OrderDto): OrderStateType[] {
  const baseFlow = DELIVERY_ORDER_FLOWS[dto.deliveryMethod] ?? DEFAULT_ORDER_FLOW;

  if (dto.stateType === "CANCELED") {
    return [...baseFlow.filter((state) => state !== "COMPLETED"), "CANCELED"];
  }

  if (dto.stateType === "ON_HOLD") {
    return insertAfter(baseFlow, "CONFIRMED", "ON_HOLD");
  }

  if (!baseFlow.includes(dto.stateType)) {
    return insertAfter(baseFlow, "PREPARING", dto.stateType);
  }

  return baseFlow;
}

function buildTimeline(dto: OrderDto): Order["timeline"] {
  const flow = resolveTimelineFlow(dto);
  const currentIndex = flow.indexOf(dto.stateType);

  return flow.map((code, index) => ({
    code,
    isCompleted: currentIndex > -1 ? index < currentIndex : false,
    isCurrent: index === currentIndex,
    isIssue: code === "CANCELED" || code === "ON_HOLD",
    timestamp:
      code === "CREATED"
        ? dto.createdAt
        : code === dto.stateType
          ? dto.statusChangedAt
          : null,
  }));
}

function formatModifierLabel(
  modifier: OrderDto["items"][number]["modifiers"][number],
) {
  const quantityPrefix = modifier.quantity > 1 ? `${modifier.quantity}x ` : "";
  return `${quantityPrefix}${modifier.optionName}`;
}

export function isActiveOrderDto(dto: OrderDto) {
  return dto.currentStatus.visibleToCustomer && !dto.currentStatus.isFinal;
}

export function selectCurrentOrderDto(dtos: OrderDto[]) {
  return dtos.find(isActiveOrderDto) ?? null;
}

export function mapOrderDtoToOrder(dto: OrderDto): Order {
  return {
    createdAt: dto.createdAt,
    currency: dto.delivery.currency,
    customerEmail: dto.customerEmail ?? null,
    customerName: dto.customerName ?? null,
    customerPhone: dto.customerPhone ?? null,
    deliveryAddress: formatDeliveryAddress(dto),
    deliveryFeePrice: dto.deliveryFeeMinor / 100,
    deliveryMethod: dto.deliveryMethod,
    deliveryMethodName: dto.delivery.methodName,
    etaMinutes: dto.delivery.estimatesMinutes ?? null,
    id: dto.id,
    isActive: isActiveOrderDto(dto),
    isCancellable: dto.currentStatus.isCancellable,
    isFinal: dto.currentStatus.isFinal,
    isVisibleToCustomer: dto.currentStatus.visibleToCustomer,
    items: dto.items.map((item) => ({
      id: item.id,
      modifiers: item.modifiers.map(formatModifierLabel),
      quantity: item.quantity,
      title: item.title,
      totalPrice: item.totalMinor / 100,
    })),
    itemsCount: dto.items.reduce((total, item) => total + item.quantity, 0),
    orderNumber: dto.orderNumber,
    paymentMethodName: dto.payment?.name ?? null,
    pickupPointAddress: dto.delivery.pickupPointAddress ?? null,
    pickupPointName: dto.delivery.pickupPointName ?? null,
    stateColor: dto.currentStatus.color ?? null,
    stateIcon: dto.currentStatus.icon ?? null,
    stateType: dto.stateType,
    statusChangedAt: dto.statusChangedAt,
    statusCode: dto.currentStatus.code || dto.status,
    statusLabel: dto.currentStatus.name || dto.statusName,
    subtotalPrice: dto.subtotalMinor / 100,
    timeline: buildTimeline(dto),
    totalPrice: dto.totalMinor / 100,
    trackingMeta: {
      courierTrackingAvailable: false,
      etaSource: dto.delivery.estimatesMinutes != null ? "backend" : "missing",
      timelineSource: "derived",
    },
    updatedAt: dto.updatedAt,
  };
}
