import type { ReactNode } from "react";

import { cn } from "@/shared/lib/styles";

type SegmentedControlOption = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

type SegmentedControlProps = {
  className?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  options: SegmentedControlOption[];
  value: string;
};

export function SegmentedControl({
  className,
  disabled = false,
  onValueChange,
  options,
  value,
}: SegmentedControlProps) {
  return (
    <div
      aria-label="Segmented control"
      className={cn(
        "border-border/80 bg-secondary/70 inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border p-1 shadow-sm",
        className,
      )}
      role="group"
    >
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "focus-visible:ring-ring inline-flex h-9 shrink-0 items-center justify-center rounded-full px-3 text-[12px] leading-none font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-default disabled:opacity-100 sm:h-10 sm:px-4 sm:text-sm",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            disabled={disabled || option.disabled}
            key={option.value}
            onClick={() => onValueChange?.(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
