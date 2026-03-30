export type Locale = "en" | "ru";

export type CurrencyCode = "EUR" | "RUB" | "USD";

export type RouteParams<T extends Record<string, string>> = Promise<T>;
