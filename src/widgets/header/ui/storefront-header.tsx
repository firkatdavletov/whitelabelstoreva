"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import { Header } from "@/widgets/header/ui/header";

export function StorefrontHeader() {
  const segment = useSelectedLayoutSegment();

  if (segment === "delivery") {
    return null;
  }

  return <Header />;
}
