import type { components, paths } from "@/shared/api/generated/schema";

export type DeliveryMethodsResponseDto =
  paths["/api/v1/delivery/methods"]["get"]["responses"][200]["content"]["application/json"];

export type DeliveryMethodDto = components["schemas"]["DeliveryMethodResponse"];

export type DetectCourierCartDeliveryDraftRequestDto =
  paths["/api/v1/delivery/courier/draft-detect"]["post"]["requestBody"]["content"]["application/json"];

export type DetectCourierCartDeliveryDraftResponseDto =
  paths["/api/v1/delivery/courier/draft-detect"]["post"]["responses"][200]["content"]["application/json"];
