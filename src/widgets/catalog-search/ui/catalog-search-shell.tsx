"use client";

import Link from "next/link";
import { LoaderCircle, Search } from "lucide-react";
import {
  startTransition,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
} from "react";

import type { Product } from "@/entities/product";
import {
  CATALOG_SEARCH_DEBOUNCE_MS,
  isCatalogSearchQueryEligible,
  normalizeCatalogSearchQuery,
} from "@/features/menu-catalog/lib/catalog-search";
import { cn } from "@/shared/lib/styles";
import type { Locale } from "@/shared/types/common";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { MenuGrid } from "@/widgets/menu-grid";

type SearchMessages = {
  empty: string;
  errorDescription: string;
  errorTitle: string;
  inputPlaceholder: string;
  loading: string;
  openMenu: string;
  resultsCount: string;
};

type CatalogSearchShellProps = {
  initialError: string | null;
  initialProducts: Product[];
  initialQuery: string | null;
  locale: Locale;
  menuHref: string;
  searchMessages: SearchMessages;
  tenantSlug: string;
};

type SearchResponse = {
  products?: Product[];
  message?: string;
};

function interpolateMessage(
  template: string,
  values: Record<string, number | string>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
}

export function CatalogSearchShell({
  initialError,
  initialProducts,
  initialQuery,
  locale,
  menuHref,
  searchMessages,
  tenantSlug,
}: CatalogSearchShellProps) {
  const inputId = useId();
  const initialEligibleQuery = isCatalogSearchQueryEligible(initialQuery)
    ? normalizeCatalogSearchQuery(initialQuery)
    : null;
  const skipInitialFetchForQueryRef = useRef(initialEligibleQuery);
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [searchError, setSearchError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);

  const syncQueryToUrl = useEffectEvent((nextQuery: string | null) => {
    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (nextQuery) {
      nextUrl.searchParams.set("query", nextQuery);
    } else {
      nextUrl.searchParams.delete("query");
    }

    window.history.replaceState(
      window.history.state,
      "",
      `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`,
    );
  });

  const fetchSearchResults = useEffectEvent(
    async (normalizedQuery: string, signal: AbortSignal) => {
      try {
        const response = await fetch(
          `/api/catalog/search?${new URLSearchParams({
            query: normalizedQuery,
            tenant: tenantSlug,
          }).toString()}`,
          {
            cache: "no-store",
            signal,
          },
        );
        const payload = (await response.json()) as SearchResponse;

        if (!response.ok) {
          throw new Error(payload.message ?? searchMessages.errorTitle);
        }

        startTransition(() => {
          setProducts(payload.products ?? []);
          setSearchError(null);
          setIsLoading(false);
        });
      } catch (error) {
        if (signal.aborted) {
          return;
        }

        startTransition(() => {
          setProducts([]);
          setSearchError(
            error instanceof Error ? error.message : searchMessages.errorTitle,
          );
          setIsLoading(false);
        });
      }
    },
  );

  useEffect(() => {
    const normalizedQuery = normalizeCatalogSearchQuery(query);

    syncQueryToUrl(normalizedQuery);

    if (
      skipInitialFetchForQueryRef.current &&
      normalizedQuery === skipInitialFetchForQueryRef.current
    ) {
      skipInitialFetchForQueryRef.current = null;
      return;
    }

    if (!normalizedQuery) {
      startTransition(() => {
        setProducts([]);
        setSearchError(null);
        setIsLoading(false);
      });
      return;
    }

    if (!isCatalogSearchQueryEligible(normalizedQuery)) {
      startTransition(() => {
        setProducts([]);
        setSearchError(null);
        setIsLoading(false);
      });
      return;
    }

    const controller = new AbortController();
    const timerId = window.setTimeout(() => {
      setIsLoading(true);
      void fetchSearchResults(normalizedQuery, controller.signal);
    }, CATALOG_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timerId);
      controller.abort();
    };
  }, [query]);

  const normalizedQuery = normalizeCatalogSearchQuery(query);
  const isEligibleQuery = isCatalogSearchQueryEligible(normalizedQuery);
  const helperMessage = isLoading
    ? searchMessages.loading
    : isEligibleQuery
      ? interpolateMessage(searchMessages.resultsCount, {
          count: products.length,
        })
      : null;

  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="border-border/60 relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_94%,white)_0%,color-mix(in_srgb,var(--background)_82%,white)_100%)]">
        <div className="border-border/45 pointer-events-none absolute -top-14 right-6 h-36 w-36 rounded-full border" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(31,26,23,0.18),transparent)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_32%)]" />

        <div className="relative flex flex-col gap-4 px-5 py-5 sm:px-7 sm:py-6">
          <label
            className="border-border/70 bg-card/85 flex items-center gap-3 rounded-full border px-4 py-3 shadow-[0_16px_36px_-30px_rgba(31,26,23,0.35)]"
            htmlFor={inputId}
          >
            <Search className="text-muted-foreground size-4 shrink-0" />
            <Input
              autoComplete="off"
              className="h-auto border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:ring-0"
              id={inputId}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder={searchMessages.inputPlaceholder}
              spellCheck={false}
              type="search"
              value={query}
            />
            <LoaderCircle
              aria-hidden="true"
              className={cn(
                "text-muted-foreground size-4 shrink-0 transition-opacity",
                isLoading ? "animate-spin opacity-100" : "opacity-0",
              )}
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div aria-live="polite" className="min-h-[0.875rem]">
              {helperMessage ? (
                <p className="text-muted-foreground text-[0.7rem] tracking-[0.28em] uppercase">
                  {helperMessage}
                </p>
              ) : null}
            </div>

            <Button
              asChild
              className="text-primary-foreground hover:text-primary-foreground rounded-full px-5"
              size="sm"
            >
              <Link href={menuHref}>{searchMessages.openMenu}</Link>
            </Button>
          </div>
        </div>
      </Card>

      {searchError ? (
        <Card className="border-border/60 bg-card/75 rounded-[1.75rem] px-5 py-5 sm:px-6">
          <div className="space-y-1.5">
            <p className="font-heading text-xl font-semibold">
              {searchMessages.errorTitle}
            </p>
            <p className="text-muted-foreground text-sm">
              {searchMessages.errorDescription}
            </p>
            <p className="text-muted-foreground text-sm">{searchError}</p>
          </div>
        </Card>
      ) : isEligibleQuery ? (
        <section>
          <MenuGrid
            activeCategorySlug={null}
            categories={[]}
            emptyLabel={interpolateMessage(searchMessages.empty, {
              query: normalizedQuery ?? "",
            })}
            locale={locale}
            products={products}
          />
        </section>
      ) : null}
    </div>
  );
}
