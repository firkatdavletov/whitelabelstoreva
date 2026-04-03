type DeliveryQuoteAvailabilitySource =
  | {
      available?: boolean | null;
      message?: string | null;
    }
  | null
  | undefined;

export function resolveDeliveryQuoteAvailability(
  quote: DeliveryQuoteAvailabilitySource,
) {
  if (!quote) {
    return null;
  }

  if (typeof quote.available === "boolean") {
    return quote.available;
  }

  return null;
}

export function resolveDeliveryQuoteUnavailableMessage(
  quote: DeliveryQuoteAvailabilitySource,
) {
  const message = quote?.message?.trim();

  return message ? message : null;
}
