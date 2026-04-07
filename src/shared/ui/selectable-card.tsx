import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/shared/lib/styles";

type SelectableCardProps = React.ComponentProps<"button"> & {
  selected: boolean;
};

const SelectableCard = React.forwardRef<HTMLButtonElement, SelectableCardProps>(
  ({ className, selected, type = "button", ...props }, ref) => {
    return (
      <button
        aria-pressed={selected}
        className={cn(
          "focus-visible:ring-ring flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
          selected
            ? "border-primary bg-primary/6 shadow-[0_18px_30px_-24px_rgba(214,92,38,0.55)]"
            : "border-border/70 bg-card hover:border-foreground/20 hover:bg-background",
          className,
        )}
        data-selected={selected ? "true" : "false"}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

SelectableCard.displayName = "SelectableCard";

type SelectableCardIndicatorProps = {
  className?: string;
  selected: boolean;
  size?: "sm" | "md";
};

function SelectableCardIndicator({
  className,
  selected,
  size = "sm",
}: SelectableCardIndicatorProps) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full border transition-colors",
        size === "md" ? "h-6 w-6" : "h-5 w-5",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border/80 bg-background text-transparent",
        className,
      )}
    >
      <Check className={size === "md" ? "h-3.5 w-3.5" : "h-3 w-3"} />
    </span>
  );
}

export { SelectableCard, SelectableCardIndicator };
