import type {
  YandexLocationVariantDto,
  YandexPickupPointDto,
} from "@/features/delivery-address/api/delivery-address.types";
import type {
  YandexLocationVariant,
  YandexPickupPoint,
} from "@/features/delivery-address/model/yandex-pickup.types";
import type { MapPickupMarker } from "@/features/delivery-address/lib/delivery-address.utils";

export function mapYandexLocationVariantDto(
  dto: YandexLocationVariantDto,
): YandexLocationVariant {
  return {
    address: dto.address,
    geoId: dto.geoId,
  };
}

export function mapYandexPickupPointDto(
  dto: YandexPickupPointDto,
): YandexPickupPoint {
  return {
    address: dto.address,
    fullAddress: dto.fullAddress ?? null,
    id: dto.id,
    instruction: dto.instruction ?? null,
    isYandexBranded: dto.isYandexBranded,
    latitude: dto.latitude ?? null,
    longitude: dto.longitude ?? null,
    name: dto.name,
    paymentMethods: dto.paymentMethods,
  };
}

export function yandexPickupPointToMapMarker(
  point: YandexPickupPoint,
): MapPickupMarker | null {
  if (point.latitude == null || point.longitude == null) {
    return null;
  }

  return {
    id: point.id,
    label: point.name,
    latitude: point.latitude,
    longitude: point.longitude,
  };
}
