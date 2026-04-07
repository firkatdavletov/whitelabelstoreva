"use client";

import {
  LoaderCircle,
  MapPin,
  Navigation,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { YandexLocationVariant } from "@/features/delivery-address/model/yandex-pickup.types";
import { Button } from "@/shared/ui/button";

type YandexPickupSearchProps = {
  courierAddressHint: string | null;
  isLoadingLocation: boolean;
  locationVariants: YandexLocationVariant[];
  onDismissVariants: () => void;
  onLocateMe: () => void;
  onSelectVariant: (variant: YandexLocationVariant) => void;
  onSubmitSearch: (query: string) => void;
  onUseCourierAddress: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const SEARCH_DEBOUNCE_MS = 500;

export function YandexPickupSearch({
  courierAddressHint,
  isLoadingLocation,
  locationVariants,
  onDismissVariants,
  onLocateMe,
  onSelectVariant,
  onSubmitSearch,
  onUseCourierAddress,
  searchQuery,
  setSearchQuery,
}: YandexPickupSearchProps) {
  const { t } = useTranslation();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSubmittedRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const scheduleSearch = (query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = query.trim();

      if (trimmed && trimmed !== lastSubmittedRef.current) {
        lastSubmittedRef.current = trimmed;
        onSubmitSearch(trimmed);
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    setSearchQuery(value);
    scheduleSearch(value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const trimmed = localQuery.trim();

    if (trimmed) {
      lastSubmittedRef.current = trimmed;
      onSubmitSearch(trimmed);
    }
  };

  return (
    <div className="pointer-events-auto w-full max-w-2xl space-y-2">
      <form
        className="relative flex items-center gap-2"
        onSubmit={handleSubmit}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoComplete="off"
            className="h-11 w-full rounded-full border border-border/70 bg-background/86 pl-10 pr-4 text-sm shadow-lg backdrop-blur-xl placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none"
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder={t("deliveryAddress.yandexSearchPlaceholder")}
            ref={inputRef}
            type="text"
            value={localQuery}
          />
          {isLoadingLocation ? (
            <LoaderCircle className="absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
          ) : null}
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          className="h-9 rounded-full border-border/70 bg-background/82 px-3.5 text-xs shadow-md backdrop-blur-xl"
          onClick={onLocateMe}
          size="sm"
          type="button"
          variant="outline"
        >
          <Navigation className="h-3.5 w-3.5" />
          {t("deliveryAddress.yandexNearMe")}
        </Button>
        {courierAddressHint ? (
          <Button
            className="h-9 rounded-full border-border/70 bg-background/82 px-3.5 text-xs shadow-md backdrop-blur-xl"
            onClick={onUseCourierAddress}
            size="sm"
            type="button"
            variant="outline"
          >
            <MapPin className="h-3.5 w-3.5" />
            {t("deliveryAddress.yandexUseCourierAddress")}
          </Button>
        ) : null}
      </div>

      {locationVariants.length > 1 ? (
        <div className="rounded-2xl border border-border/70 bg-background/90 shadow-lg backdrop-blur-xl">
          <p className="px-4 pt-3 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {t("deliveryAddress.yandexClarifyLocation")}
          </p>
          <div className="py-1.5">
            {locationVariants.map((variant) => (
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent/50"
                key={variant.geoId}
                onClick={() => onSelectVariant(variant)}
                type="button"
              >
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{variant.address}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-border/50 px-4 py-2">
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={onDismissVariants}
              type="button"
            >
              {t("deliveryAddress.yandexDismissVariants")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
