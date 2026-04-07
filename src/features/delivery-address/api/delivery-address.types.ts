import type { components, paths } from "@/shared/api/generated/schema";

export type DeliveryMethodsResponseDto =
  paths["/api/v1/delivery/methods"]["get"]["responses"][200]["content"]["application/json"];

export type DeliveryMethodDto = components["schemas"]["DeliveryMethodResponse"];

export type PickupPointsResponseDto =
  paths["/api/v1/delivery/pickup-points"]["get"]["responses"][200]["content"]["application/json"];

export type PickupPointDto = components["schemas"]["PickupPointResponse"];

export type DetectCourierCartDeliveryDraftRequestDto =
  paths["/api/v1/delivery/courier/draft-detect"]["post"]["requestBody"]["content"]["application/json"];

export type DetectCourierCartDeliveryDraftResponseDto =
  paths["/api/v1/delivery/courier/draft-detect"]["post"]["responses"][200]["content"]["application/json"];

export type YandexLocationDetectRequestDto =
  components["schemas"]["YandexLocationDetectRequest"];

export type YandexLocationDetectResponseDto =
  components["schemas"]["YandexLocationDetectResponse"];

export type YandexLocationVariantDto =
  components["schemas"]["YandexLocationVariantResponse"];

export type YandexPickupPointsRequestDto =
  components["schemas"]["YandexPickupPointsRequest"];

export type YandexPickupPointsResponseDto =
  components["schemas"]["YandexPickupPointsResponse"];

export type YandexPickupPointDto =
  components["schemas"]["YandexPickupPointResponse"];
