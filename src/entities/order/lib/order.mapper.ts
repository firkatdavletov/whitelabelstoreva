import type {
  OrderDeliveryMethod,
  OrderDto,
  OrderStateType,
} from "@/entities/order/api/order.dto";
import type {
  Order,
  OrderTimelineStep,
} from "@/entities/order/model/order.types";

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
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .join(", ");
}

function normalizePickupAddress(address: string | null | undefined) {
  if (!address) {
    return null;
  }

  const normalizedParts = address
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const houseMatch = /^house[\s.:#-]*(.+)$/i.exec(part);

      if (houseMatch) {
        return `дом ${houseMatch[1].trim()}`;
      }

      return part;
    })
    .filter(
      (part) =>
        !/^(?:postal(?:\s*code)?|zip(?:\s*code)?|индекс)?[\s.:#-]*\d{5,6}$/i.test(
          part,
        ) &&
        !/^(россия|российская федерация|russia|russian federation)$/i.test(
          part,
        ) &&
        !/^(?:.*\s)?(область|обл\.|край|республика|region|oblast|province|district)$/i.test(
          part,
        ),
    );

  return normalizedParts.join(", ") || null;
}

function formatDeliveryAddress(dto: OrderDto) {
  if (dto.delivery.address) {
    const primaryLine = buildAddressLine([
      dto.delivery.address.street,
      dto.delivery.address.house ? `дом ${dto.delivery.address.house}` : null,
    ]);
    const secondaryLine = buildAddressLine([
      dto.delivery.address.apartment
        ? `кв. ${dto.delivery.address.apartment}`
        : null,
      dto.delivery.address.city,
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
  const baseFlow =
    DELIVERY_ORDER_FLOWS[dto.deliveryMethod] ?? DEFAULT_ORDER_FLOW;

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

function isIssueState(code: string) {
  return code === "CANCELED" || code === "ON_HOLD";
}

function buildDerivedTimeline(dto: OrderDto): Order["timeline"] {
  const flow = resolveTimelineFlow(dto);
  const currentIndex = flow.indexOf(dto.stateType);

  return flow.map((code, index) => ({
    code,
    id: `derived-${code}-${index}`,
    isCompleted: currentIndex > -1 ? index < currentIndex : false,
    isCurrent: index === currentIndex,
    isIssue: isIssueState(code),
    label: null,
    timestamp:
      code === "CREATED"
        ? dto.createdAt
        : code === dto.stateType
          ? dto.statusChangedAt
          : null,
  }));
}

type TimelineSeed = Pick<
  OrderTimelineStep,
  "code" | "id" | "label" | "timestamp"
>;

function resolveTimestampOrder(value: string | null | undefined) {
  if (!value) {
    return Number.NaN;
  }

  return Date.parse(value);
}

function findLastTimelineIndex(
  timeline: TimelineSeed[],
  predicate: (step: TimelineSeed) => boolean,
) {
  for (let index = timeline.length - 1; index >= 0; index -= 1) {
    if (predicate(timeline[index])) {
      return index;
    }
  }

  return -1;
}

function resolveCurrentTimelineCodes(dto: OrderDto) {
  return [dto.currentStatus.code, dto.status, dto.stateType].filter(
    (code, index, codes): code is string =>
      Boolean(code) && codes.indexOf(code) === index,
  );
}

function matchesCurrentTimelineStep(stepCode: string, dto: OrderDto) {
  return resolveCurrentTimelineCodes(dto).includes(stepCode);
}

function normalizeStatusHistory(dto: OrderDto): TimelineSeed[] {
  const history = [...(dto.statusHistory ?? [])]
    .map((entry, index) => ({
      code: entry.code,
      id: `history-${index}-${entry.code}-${entry.timestamp}`,
      label: entry.name || null,
      originalIndex: index,
      timestamp: entry.timestamp ?? null,
    }))
    .filter((entry) => entry.code)
    .sort((left, right) => {
      const leftTimestamp = resolveTimestampOrder(left.timestamp);
      const rightTimestamp = resolveTimestampOrder(right.timestamp);

      if (Number.isNaN(leftTimestamp) || Number.isNaN(rightTimestamp)) {
        return left.originalIndex - right.originalIndex;
      }

      if (leftTimestamp === rightTimestamp) {
        return left.originalIndex - right.originalIndex;
      }

      return leftTimestamp - rightTimestamp;
    })
    .map(({ code, id, label, timestamp }) => ({
      code,
      id,
      label,
      timestamp,
    }));

  if (!history.length) {
    return history;
  }

  const currentStepIndex = findLastTimelineIndex(history, (step) =>
    matchesCurrentTimelineStep(step.code, dto),
  );

  if (currentStepIndex > -1) {
    return history;
  }

  return [
    ...history,
    {
      code: dto.currentStatus.code || dto.status || dto.stateType,
      id: `history-current-${dto.currentStatus.code || dto.status || dto.stateType}-${dto.statusChangedAt}`,
      label: dto.currentStatus.name || dto.statusName || null,
      timestamp: dto.statusChangedAt,
    },
  ];
}

function createTimelineStep(
  step: TimelineSeed,
  currentIndex: number,
  index: number,
): OrderTimelineStep {
  return {
    ...step,
    isCompleted: index < currentIndex,
    isCurrent: index === currentIndex,
    isIssue: isIssueState(step.code),
  };
}

function buildBackendTimeline(dto: OrderDto): Order["timeline"] | null {
  const history = normalizeStatusHistory(dto);

  if (!history.length) {
    return null;
  }

  const currentIndex = findLastTimelineIndex(history, (step) =>
    matchesCurrentTimelineStep(step.code, dto),
  );
  const timeline = history.map((step, index) =>
    createTimelineStep(step, currentIndex, index),
  );
  const flow = resolveTimelineFlow(dto);
  const currentFlowIndex = flow.indexOf(dto.stateType);

  if (currentFlowIndex === -1) {
    return timeline;
  }

  const seenCodes = new Set(history.map((step) => step.code));
  const upcomingSteps = flow
    .slice(currentFlowIndex + 1)
    .filter((code) => !seenCodes.has(code))
    .map((code, index) =>
      createTimelineStep(
        {
          code,
          id: `predicted-${code}-${index}`,
          label: null,
          timestamp: null,
        },
        -1,
        index,
      ),
    );

  return [...timeline, ...upcomingSteps];
}

function buildTimeline(dto: OrderDto): Order["timeline"] {
  return buildBackendTimeline(dto) ?? buildDerivedTimeline(dto);
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
    pickupPointAddress: normalizePickupAddress(dto.delivery.pickupPointAddress),
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
      timelineSource: dto.statusHistory?.length ? "backend" : "derived",
    },
    updatedAt: dto.updatedAt,
  };
}
