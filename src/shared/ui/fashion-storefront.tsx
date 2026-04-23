import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/styles";
import { Button, type ButtonProps } from "@/shared/ui/button";

const fashionSurfaceVariants = cva(
  "border border-border/70 bg-card relative overflow-hidden rounded-none",
  {
    defaultVariants: {
      interactive: false,
      tone: "default",
    },
    variants: {
      interactive: {
        false: "",
        true: "transition duration-300 hover:border-primary/32",
      },
      tone: {
        default: "",
        inset: "bg-background/58",
        media: "bg-muted/20",
        transparent: "bg-transparent",
      },
    },
  },
);

type FashionSurfaceProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof fashionSurfaceVariants> & {
    asChild?: boolean;
  };

export function FashionSurface({
  asChild = false,
  className,
  interactive,
  tone,
  ...props
}: FashionSurfaceProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      className={cn(fashionSurfaceVariants({ interactive, tone }), className)}
      {...props}
    />
  );
}

const fashionMediaFrameVariants = cva(
  "bg-muted/20 relative overflow-hidden rounded-none",
  {
    defaultVariants: {
      overlay: "none",
      ratio: "auto",
    },
    variants: {
      overlay: {
        none: "",
        bottom:
          "after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,transparent,rgba(17,14,11,0.52))] after:content-['']",
        editorial:
          "after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(33,26,18,0.04),rgba(33,26,18,0.22))] after:content-['']",
      },
      ratio: {
        auto: "",
        hero: "h-full min-h-[18rem] lg:min-h-0",
        portrait: "aspect-[4/5]",
        poster: "aspect-[3/4]",
      },
    },
  },
);

type FashionMediaFrameProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof fashionMediaFrameVariants>;

export function FashionMediaFrame({
  className,
  overlay,
  ratio,
  ...props
}: FashionMediaFrameProps) {
  return (
    <div
      className={cn(fashionMediaFrameVariants({ overlay, ratio }), className)}
      {...props}
    />
  );
}

const fashionKickerVariants = cva(
  "text-muted-foreground font-medium uppercase",
  {
    defaultVariants: {
      size: "default",
    },
    variants: {
      size: {
        compact: "text-[0.66rem] tracking-[0.22em]",
        default: "text-[0.7rem] tracking-[0.24em]",
      },
    },
  },
);

type FashionKickerProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof fashionKickerVariants>;

export function FashionKicker({
  className,
  size,
  ...props
}: FashionKickerProps) {
  return (
    <p className={cn(fashionKickerVariants({ size }), className)} {...props} />
  );
}

const fashionTitleVariants = cva(
  "font-heading leading-none tracking-tight text-foreground",
  {
    defaultVariants: {
      size: "section",
      weight: "medium",
    },
    variants: {
      size: {
        card: "text-lg sm:text-xl",
        hero: "max-w-[12ch] text-4xl sm:text-5xl lg:text-6xl",
        order: "text-2xl sm:text-[2rem]",
        product: "text-sm leading-5 md:text-base md:leading-5",
        section: "text-2xl sm:text-[2rem]",
      },
      weight: {
        medium: "font-medium",
        semibold: "font-semibold",
      },
    },
  },
);

type FashionTitleProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof fashionTitleVariants> & {
    as?: "h1" | "h2" | "h3" | "p" | "span";
  };

export function FashionTitle({
  as = "h2",
  className,
  size,
  weight,
  ...props
}: FashionTitleProps) {
  const Comp = as;

  return (
    <Comp
      className={cn(fashionTitleVariants({ size, weight }), className)}
      {...props}
    />
  );
}

const fashionTextVariants = cva("text-muted-foreground", {
  defaultVariants: {
    size: "body",
  },
  variants: {
    size: {
      body: "text-sm leading-6 sm:text-base",
      compact: "text-sm",
      meta: "text-sm leading-5",
    },
  },
});

type FashionTextProps = React.HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof fashionTextVariants>;

export function FashionText({ className, size, ...props }: FashionTextProps) {
  return (
    <p className={cn(fashionTextVariants({ size }), className)} {...props} />
  );
}

const fashionMetaLabelVariants = cva(
  "inline-flex items-center border px-3 py-1 font-medium uppercase rounded-none",
  {
    defaultVariants: {
      tone: "neutral",
    },
    variants: {
      tone: {
        accent:
          "border-transparent bg-primary/12 text-primary text-[0.66rem] tracking-[0.22em]",
        neutral:
          "border-border/70 bg-background/76 text-muted-foreground text-[0.66rem] tracking-[0.22em]",
      },
    },
  },
);

type FashionMetaLabelProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof fashionMetaLabelVariants>;

export function FashionMetaLabel({
  className,
  tone,
  ...props
}: FashionMetaLabelProps) {
  return (
    <span
      className={cn(fashionMetaLabelVariants({ tone }), className)}
      {...props}
    />
  );
}

export function FashionActionButton({
  asChild = false,
  className,
  type,
  variant = "default",
  ...props
}: ButtonProps) {
  return (
    <Button
      asChild={asChild}
      className={cn("rounded-none px-5 shadow-none", className)}
      type={asChild ? undefined : (type ?? "button")}
      variant={variant}
      {...props}
    />
  );
}

export function FashionIconButton({
  asChild = false,
  className,
  type,
  variant = "outline",
  ...props
}: ButtonProps) {
  return (
    <Button
      asChild={asChild}
      className={cn(
        "border-border/70 bg-background/84 text-foreground hover:border-primary/32 hover:text-primary h-10 w-10 rounded-none px-0 shadow-none",
        className,
      )}
      size="icon"
      type={asChild ? undefined : (type ?? "button")}
      variant={variant}
      {...props}
    />
  );
}

type FashionMetricGridProps = React.HTMLAttributes<HTMLDivElement>;

export function FashionMetricGrid({
  className,
  ...props
}: FashionMetricGridProps) {
  return (
    <div
      className={cn(
        "border-border/70 bg-background/58 grid min-w-[164px] grid-cols-2 gap-4 border p-4 sm:min-w-[220px]",
        className,
      )}
      {...props}
    />
  );
}

type FashionMetricProps = {
  align?: "left" | "right";
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
};

export function FashionMetric({
  align = "left",
  label,
  value,
  valueClassName,
}: FashionMetricProps) {
  return (
    <div className={cn("space-y-1", align === "right" && "text-right")}>
      <FashionKicker size="compact">{label}</FashionKicker>
      <p className={cn("text-foreground text-sm font-medium", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

type FashionPagerDotsProps<Item> = {
  activeIndex: number;
  className?: string;
  getLabel: (item: Item, index: number) => string;
  items: Item[];
  onSelect: (index: number) => void;
};

export function FashionPagerDots<Item>({
  activeIndex,
  className,
  getLabel,
  items,
  onSelect,
}: FashionPagerDotsProps<Item>) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {items.map((item, index) => (
        <button
          aria-current={index === activeIndex ? "true" : undefined}
          aria-label={getLabel(item, index)}
          className={cn(
            "border-primary/26 h-1.5 cursor-pointer border transition-all",
            index === activeIndex
              ? "bg-primary w-5"
              : "hover:bg-primary/18 w-1.5 bg-transparent",
          )}
          key={`${getLabel(item, index)}-${index}`}
          onClick={() => onSelect(index)}
          type="button"
        />
      ))}
    </div>
  );
}
