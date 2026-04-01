type DeliveryQuoteEtaSource = {
  estimatedDays?: number | null;
  estimatedMinutes?: number | null;
  estimatesMinutes?: number | null;
  message?: string | null;
};

export type DeliveryQuoteEta =
  | {
      kind: "days";
      value: number;
    }
  | {
      kind: "message";
      value: string;
    }
  | {
      kind: "minutes";
      value: number;
    };

function isNonNegativeNumber(
  value: number | null | undefined,
): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function resolveDeliveryQuoteEta(
  quote: DeliveryQuoteEtaSource | null | undefined,
): DeliveryQuoteEta | null {
  if (!quote) {
    return null;
  }

  const estimatedMinutes =
    quote.estimatedMinutes ?? quote.estimatesMinutes ?? null;

  // Prefer structured ETA over backend message text so every surface stays consistent.
  if (isNonNegativeNumber(estimatedMinutes)) {
    return {
      kind: "minutes",
      value: estimatedMinutes,
    };
  }

  const message = quote.message?.trim();

  if (message) {
    return {
      kind: "message",
      value: message,
    };
  }

  if (isNonNegativeNumber(quote.estimatedDays)) {
    return {
      kind: "days",
      value: quote.estimatedDays,
    };
  }

  return null;
}
