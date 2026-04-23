"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/shared/lib/styles";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "bg-foreground/30 data-[state=open]:animate-in data-[state=closed]:animate-out fixed inset-0 z-50 backdrop-blur-sm",
      className,
    )}
    ref={ref}
    {...props}
  />
));

SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

type SheetContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  side?: "bottom" | "left" | "right" | "top";
};

const sideClasses: Record<NonNullable<SheetContentProps["side"]>, string> = {
  bottom: "inset-x-0 bottom-0 rounded-t-2xl border-t",
  left: "inset-y-0 left-0 h-full w-4/5 border-r sm:max-w-md",
  right: "inset-y-0 right-0 h-full w-full border-l sm:max-w-md",
  top: "inset-x-0 top-0 rounded-b-2xl border-b",
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ children, className, side = "right", ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <DialogPrimitive.Content
      className={cn(
        "bg-card data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 p-6 shadow-2xl transition",
        sideClasses[side],
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
      <SheetClose className="text-muted-foreground hover:bg-secondary hover:text-foreground absolute top-4 right-4 rounded-full p-1 transition-colors">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetClose>
    </DialogPrimitive.Content>
  </SheetPortal>
));

SheetContent.displayName = DialogPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mb-4 flex flex-col gap-1.5 text-left", className)}
    {...props}
  />
);

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn(
      "font-heading text-foreground text-xl font-semibold",
      className,
    )}
    ref={ref}
    {...props}
  />
));

SheetTitle.displayName = DialogPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    ref={ref}
    {...props}
  />
));

SheetDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
