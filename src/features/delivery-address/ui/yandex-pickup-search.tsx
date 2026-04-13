"use client";

import { LoaderCircle, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/styles";

type YandexPickupSearchProps = {
  className?: string;
  isLoadingLocation: boolean;
  onSubmitSearch: (query: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const SEARCH_DEBOUNCE_MS = 500;

export function YandexPickupSearch({
  className,
  isLoadingLocation,
  onSubmitSearch,
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
    <div className={cn("pointer-events-auto w-full", className)}>
      <form
        className="relative flex items-center gap-2"
        onSubmit={handleSubmit}
      >
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
          <input
            autoComplete="off"
            className="border-border/70 bg-background/70 placeholder:text-muted-foreground/70 focus:border-primary/50 h-11 w-full rounded-2xl border pr-10 pl-10 text-sm shadow-sm focus:outline-none"
            onChange={(event) => handleInputChange(event.target.value)}
            placeholder={t("deliveryAddress.yandexSearchPlaceholder")}
            ref={inputRef}
            type="text"
            value={localQuery}
          />
          {isLoadingLocation ? (
            <LoaderCircle className="text-primary absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 animate-spin" />
          ) : null}
        </div>
      </form>
    </div>
  );
}
