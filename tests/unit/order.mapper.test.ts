import { describe, expect, it } from "vitest";

import { mapOrderDtoToOrder } from "@/entities/order";
import { createMockOrderDto } from "@/features/order-tracking/lib/order-mocks";

describe("mapOrderDtoToOrder", () => {
  it("uses backend status history for the timeline and keeps upcoming milestones", () => {
    const dto = createMockOrderDto({
      orderId: "order-1",
      stateType: "OUT_FOR_DELIVERY",
    });

    dto.statusHistory = [
      {
        code: "CREATED",
        name: "Created",
        timestamp: "2026-04-05T08:00:00.000Z",
      },
      {
        code: "AWAITING_CONFIRMATION",
        name: "Awaiting confirmation",
        timestamp: "2026-04-05T08:05:00.000Z",
      },
      {
        code: "CONFIRMED",
        name: "Confirmed",
        timestamp: "2026-04-05T08:10:00.000Z",
      },
      {
        code: "PREPARING",
        name: "Preparing",
        timestamp: "2026-04-05T08:20:00.000Z",
      },
      {
        code: "OUT_FOR_DELIVERY",
        name: "Out for delivery",
        timestamp: "2026-04-05T08:35:00.000Z",
      },
    ];

    const order = mapOrderDtoToOrder(dto);

    expect(order.trackingMeta.timelineSource).toBe("backend");
    expect(order.deliveryAddress).toBe(
      "Lenina Ave, дом 15, кв. 12, Yekaterinburg",
    );
    expect(
      order.timeline.map((step) => ({
        code: step.code,
        isCompleted: step.isCompleted,
        isCurrent: step.isCurrent,
        timestamp: step.timestamp,
      })),
    ).toEqual([
      {
        code: "CREATED",
        isCompleted: true,
        isCurrent: false,
        timestamp: "2026-04-05T08:00:00.000Z",
      },
      {
        code: "AWAITING_CONFIRMATION",
        isCompleted: true,
        isCurrent: false,
        timestamp: "2026-04-05T08:05:00.000Z",
      },
      {
        code: "CONFIRMED",
        isCompleted: true,
        isCurrent: false,
        timestamp: "2026-04-05T08:10:00.000Z",
      },
      {
        code: "PREPARING",
        isCompleted: true,
        isCurrent: false,
        timestamp: "2026-04-05T08:20:00.000Z",
      },
      {
        code: "OUT_FOR_DELIVERY",
        isCompleted: false,
        isCurrent: true,
        timestamp: "2026-04-05T08:35:00.000Z",
      },
      {
        code: "COMPLETED",
        isCompleted: false,
        isCurrent: false,
        timestamp: null,
      },
    ]);
  });

  it("falls back to a derived timeline when backend history is missing", () => {
    const dto = createMockOrderDto({
      orderId: "order-2",
      stateType: "PREPARING",
    });

    dto.statusHistory = [];

    const order = mapOrderDtoToOrder(dto);

    expect(order.trackingMeta.timelineSource).toBe("derived");
    expect(order.timeline.map((step) => step.code)).toEqual([
      "CREATED",
      "AWAITING_CONFIRMATION",
      "CONFIRMED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "COMPLETED",
    ]);
    expect(order.timeline.find((step) => step.isCurrent)?.code).toBe(
      "PREPARING",
    );
  });

  it("does not duplicate the current step when history uses backend status codes", () => {
    const dto = createMockOrderDto({
      orderId: "order-3",
      stateType: "AWAITING_CONFIRMATION",
    });

    dto.status = "PENDING";
    dto.statusHistory = [
      {
        code: "PENDING",
        name: "Ожидает подтверждения",
        timestamp: "2026-04-05T16:43:18.516669Z",
      },
    ];
    dto.currentStatus.code = "PENDING";
    dto.currentStatus.name = "Ожидает подтверждения";

    const order = mapOrderDtoToOrder(dto);

    expect(order.timeline.find((step) => step.isCurrent)?.code).toBe("PENDING");
    expect(order.timeline.some((step) => step.code === "AWAITING_CONFIRMATION")).toBe(false);
    expect(order.timeline.map((step) => step.code)).toEqual([
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "OUT_FOR_DELIVERY",
      "COMPLETED",
    ]);
  });
});
