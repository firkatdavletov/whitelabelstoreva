"use client";

import { usePathname } from "next/navigation";

type FooterVisibilityProps = {
  children: React.ReactNode;
};

export function FooterVisibility({ children }: FooterVisibilityProps) {
  const pathname = usePathname();

  if (pathname.endsWith("/delivery")) {
    return null;
  }

  return children;
}
