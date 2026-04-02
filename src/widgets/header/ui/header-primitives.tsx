"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, MapPin } from "lucide-react";

import { cn } from "@/shared/lib/styles";
import { Button } from "@/shared/ui/button";

function buildLogoMark(logoText: string) {
  const letters = logoText
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return letters || logoText.slice(0, 2).toUpperCase();
}

type HeaderBrandProps = {
  href: string;
  logoText: string;
  title: string;
};

export function HeaderBrand({ href, logoText, title }: HeaderBrandProps) {
  return (
    <Link className="flex min-w-0 items-center gap-3" href={href}>
      <span className="bg-card border-border/70 text-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold tracking-[0.24em] shadow-sm">
        {buildLogoMark(logoText)}
      </span>
      <span className="min-w-0">
        <span className="font-heading text-foreground block truncate text-base font-semibold tracking-[0.18em] sm:text-lg">
          {logoText}
        </span>
        <span className="text-muted-foreground hidden truncate text-xs md:block">
          {title}
        </span>
      </span>
    </Link>
  );
}

type HeaderActionLinkProps = {
  className?: string;
  href: string;
  icon: ReactNode;
  label: string;
  labelClassName?: string;
};

export function HeaderActionLink({
  className,
  href,
  icon,
  label,
  labelClassName,
}: HeaderActionLinkProps) {
  return (
    <Button
      asChild
      className={cn(
        "bg-card/82 border-border/70 hover:bg-card h-10 w-10 rounded-full px-0 shadow-sm sm:w-auto sm:px-4",
        className,
      )}
      variant="outline"
    >
      <Link href={href}>
        <span aria-hidden="true" className="shrink-0">
          {icon}
        </span>
        <span className="sr-only">{label}</span>
        <span
          className={cn("hidden text-sm font-medium lg:inline", labelClassName)}
        >
          {label}
        </span>
      </Link>
    </Button>
  );
}

type HeaderAddressLinkProps = {
  address: string;
  className?: string;
  etaLabel?: string | null;
  href: string;
  label: string;
};

export function HeaderAddressLink({
  address,
  className,
  etaLabel,
  href,
  label,
}: HeaderAddressLinkProps) {
  return (
    <Button
      asChild
      className={cn(
        "hover:text-foreground h-auto w-full justify-start gap-2 rounded-xl border-0 bg-transparent px-0 py-1 text-left shadow-none hover:bg-transparent",
        className,
      )}
      variant="ghost"
    >
      <Link href={href}>
        <MapPin className="text-muted-foreground h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 text-left">
          <span className="text-muted-foreground block text-[0.65rem] tracking-[0.18em] uppercase">
            {label}
          </span>
          <span className="text-foreground block truncate text-sm font-medium sm:text-[0.95rem]">
            {address}
          </span>
        </span>
        {etaLabel ? (
          <span className="text-muted-foreground hidden shrink-0 text-xs md:inline">
            {etaLabel}
          </span>
        ) : null}
        <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
      </Link>
    </Button>
  );
}
