import * as React from "react";

import { cn } from "@/shared/lib/styles";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        className={cn(
          "border-border bg-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex h-11 w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
