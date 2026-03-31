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
        "border-border/80 bg-secondary/70 inline-flex w-fit items-center rounded-full border p-1 shadow-sm",
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
              "focus-visible:ring-ring inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-default disabled:opacity-100",
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
