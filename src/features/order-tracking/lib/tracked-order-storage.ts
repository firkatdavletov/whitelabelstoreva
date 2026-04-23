const TRACKED_ORDERS_STORAGE_KEY = "storefront_tracked_orders";
const MAX_TRACKED_ORDERS_PER_TENANT = 5;

type TrackedOrdersByTenant = Record<string, string[]>;

function readTrackedOrders() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const rawValue = window.localStorage.getItem(TRACKED_ORDERS_STORAGE_KEY);

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!parsedValue || typeof parsedValue !== "object") {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedValue).map(([tenantSlug, orderIds]) => [
        tenantSlug,
        Array.isArray(orderIds)
          ? orderIds.filter(
              (orderId): orderId is string => typeof orderId === "string",
            )
          : [],
      ]),
    );
  } catch {
    return {};
  }
}

function writeTrackedOrders(value: TrackedOrdersByTenant) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      TRACKED_ORDERS_STORAGE_KEY,
      JSON.stringify(value),
    );
  } catch {
    // Ignore storage write failures and keep the app functional.
  }
}

export function listTrackedOrderIds(tenantSlug: string) {
  const trackedOrders = readTrackedOrders();
  return trackedOrders[tenantSlug] ?? [];
}

export function rememberTrackedOrderId(tenantSlug: string, orderId: string) {
  const trackedOrders = readTrackedOrders();
  const nextOrderIds = [
    orderId,
    ...(trackedOrders[tenantSlug] ?? []).filter(
      (trackedOrderId) => trackedOrderId !== orderId,
    ),
  ].slice(0, MAX_TRACKED_ORDERS_PER_TENANT);

  writeTrackedOrders({
    ...trackedOrders,
    [tenantSlug]: nextOrderIds,
  });
}

export function forgetTrackedOrderId(tenantSlug: string, orderId: string) {
  const trackedOrders = readTrackedOrders();
  const nextOrderIds = (trackedOrders[tenantSlug] ?? []).filter(
    (trackedOrderId) => trackedOrderId !== orderId,
  );

  if (!nextOrderIds.length) {
    const nextTrackedOrders = { ...trackedOrders };
    delete nextTrackedOrders[tenantSlug];
    writeTrackedOrders(nextTrackedOrders);
    return;
  }

  writeTrackedOrders({
    ...trackedOrders,
    [tenantSlug]: nextOrderIds,
  });
}

export function syncTrackedOrderId(
  tenantSlug: string,
  orderId: string,
  isActive: boolean,
) {
  if (isActive) {
    rememberTrackedOrderId(tenantSlug, orderId);
    return;
  }

  forgetTrackedOrderId(tenantSlug, orderId);
}
