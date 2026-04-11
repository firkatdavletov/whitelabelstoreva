"use client";

import { env } from "@/shared/config/env";
import { toAbsoluteUrl } from "@/shared/lib/storefront-metadata";

export type AnalyticsCommerceItem = {
  currency: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity?: number;
};

type CommerceEventName =
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "view_item";

type TrackCommerceEventInput = {
  currency: string;
  event: CommerceEventName;
  items: AnalyticsCommerceItem[];
  orderId?: string;
  value: number;
};

const META_EVENT_MAP = {
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  view_item: "ViewContent",
} as const satisfies Record<CommerceEventName, string>;

function getYandexMetrikaId() {
  const rawId = env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

  return rawId ? Number(rawId) : null;
}

function ensureDataLayer() {
  if (typeof window === "undefined") {
    return [];
  }

  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

function buildGaItems(items: AnalyticsCommerceItem[]) {
  return items.map((item) => ({
    item_id: item.itemId,
    item_name: item.itemName,
    price: item.price,
    quantity: item.quantity ?? 1,
  }));
}

function buildMetaContents(items: AnalyticsCommerceItem[]) {
  return items.map((item) => ({
    id: item.itemId,
    quantity: item.quantity ?? 1,
  }));
}

export function trackPageView(
  path: string,
  options?: {
    includeYandex?: boolean;
  },
) {
  if (typeof window === "undefined") {
    return;
  }

  const pagePath = path.startsWith("/") ? path : `/${path}`;
  const pageLocation = toAbsoluteUrl(pagePath);
  const dataLayer = ensureDataLayer();

  dataLayer.push({
    event: "page_view",
    page_location: pageLocation,
    page_path: pagePath,
  });

  window.gtag?.("event", "page_view", {
    page_location: pageLocation,
    page_path: pagePath,
  });
  window.fbq?.("track", "PageView");

  if (options?.includeYandex === false) {
    return;
  }

  const yandexMetrikaId = getYandexMetrikaId();

  if (yandexMetrikaId) {
    window.ym?.(yandexMetrikaId, "hit", pageLocation);
  }
}

export function trackCommerceEvent({
  currency,
  event,
  items,
  orderId,
  value,
}: TrackCommerceEventInput) {
  if (typeof window === "undefined") {
    return;
  }

  const gaItems = buildGaItems(items);
  const eventPayload = {
    currency,
    items: gaItems,
    ...(orderId ? { transaction_id: orderId } : {}),
    value,
  };

  const dataLayer = ensureDataLayer();

  dataLayer.push({ ecommerce: null });
  dataLayer.push({
    ecommerce: eventPayload,
    event,
  });

  window.gtag?.("event", event, eventPayload);

  const yandexMetrikaId = getYandexMetrikaId();

  if (yandexMetrikaId) {
    window.ym?.(yandexMetrikaId, "reachGoal", event, eventPayload);
  }

  window.fbq?.("track", META_EVENT_MAP[event], {
    content_ids: items.map((item) => item.itemId),
    content_name: items.map((item) => item.itemName).join(", "),
    content_type: "product",
    contents: buildMetaContents(items),
    currency,
    ...(orderId ? { order_id: orderId } : {}),
    value,
  });
}
