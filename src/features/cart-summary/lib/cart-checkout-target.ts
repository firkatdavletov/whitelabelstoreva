import type { StorefrontCart, StorefrontCartDelivery } from "@/entities/cart";

function hasCourierAddress(delivery: StorefrontCartDelivery | null | undefined) {
  const address = delivery?.address;

  if (!address) {
    return false;
  }

  return Boolean(address.city || address.house || address.street);
}

export function hasSelectedCartDelivery(
  delivery: StorefrontCartDelivery | null | undefined,
) {
  if (!delivery?.deliveryMethod) {
    return false;
  }

  if (hasCourierAddress(delivery)) {
    return true;
  }

  return Boolean(delivery.pickupPointAddress || delivery.pickupPointName);
}

type ResolveCartCheckoutTargetInput = {
  allowGuestCheckout: boolean;
  authHref: string;
  checkoutHref: string;
  deliveryHref: string;
  isAuthorized: boolean;
  storefrontCart: StorefrontCart | null | undefined;
};

export function resolveCartCheckoutTarget({
  allowGuestCheckout,
  authHref,
  checkoutHref,
  deliveryHref,
  isAuthorized,
  storefrontCart,
}: ResolveCartCheckoutTargetInput) {
  if (!isAuthorized && !allowGuestCheckout) {
    return authHref;
  }

  return hasSelectedCartDelivery(storefrontCart?.delivery)
    ? checkoutHref
    : deliveryHref;
}
