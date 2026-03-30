import type { RestaurantDto } from "@/entities/restaurant/api/restaurant.dto";
import type { Restaurant } from "@/entities/restaurant/model/restaurant.types";

export function mapRestaurantDtoToRestaurant(dto: RestaurantDto): Restaurant {
  return {
    city: dto.city,
    currency: dto.currency,
    deliveryEtaMinutes: dto.delivery_eta_minutes,
    id: dto.id,
    kitchenNote: dto.kitchen_note,
    minOrderAmount: dto.min_order_amount_minor / 100,
    name: dto.name,
    tenantSlug: dto.tenant_slug,
  };
}
