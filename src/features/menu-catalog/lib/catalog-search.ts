export const CATALOG_SEARCH_MIN_QUERY_LENGTH = 3;
export const CATALOG_SEARCH_DEBOUNCE_MS = 350;

export function normalizeCatalogSearchQuery(
  query: string | string[] | null | undefined,
) {
  const candidate = Array.isArray(query) ? query[0] : query;
  const normalized = candidate?.trim();

  return normalized ? normalized : null;
}

export function isCatalogSearchQueryEligible(
  query: string | string[] | null | undefined,
) {
  const normalizedQuery = normalizeCatalogSearchQuery(query);

  return (
    normalizedQuery !== null &&
    normalizedQuery.length >= CATALOG_SEARCH_MIN_QUERY_LENGTH
  );
}
