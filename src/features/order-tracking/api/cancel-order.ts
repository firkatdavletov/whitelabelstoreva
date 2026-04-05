import { mapOrderDtoToOrder } from "@/entities/order";
import { apiRequest } from "@/shared/api";
import { env } from "@/shared/config/env";

import { createMockOrderDto } from "@/features/order-tracking/lib/order-mocks";
import type { CancelOrderRequestDto, OrderDto } from "@/entities/order";

export async function cancelOrder(
  orderId: string,
  input?: CancelOrderRequestDto,
) {
  let dto: OrderDto;

  if (env.apiMocksEnabled) {
    dto = createMockOrderDto({
      orderId,
      stateType: "CANCELED",
    });
  } else {
    dto = await apiRequest<OrderDto, CancelOrderRequestDto>(
      `/v1/orders/${orderId}/cancel`,
      {
        body: input,
        method: "POST",
      },
    );
  }

  return mapOrderDtoToOrder(dto);
}
