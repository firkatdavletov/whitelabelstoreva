import Link from "next/link";

import { buildStorefrontPath } from "@/shared/config/routing";
import { getDictionary } from "@/shared/i18n/dictionary";
import type { Locale } from "@/shared/types/common";
import { FooterVisibility } from "@/widgets/footer/ui/footer-visibility";

type FooterProps = {
  locale: Locale;
  supportEmail: string;
  tenantSlug: string;
  tenantTitle: string;
};

export async function Footer({
  locale,
  supportEmail,
  tenantSlug,
  tenantTitle,
}: FooterProps) {
  const dictionary = await getDictionary(locale);
  const legalLinks = [
    {
      href: buildStorefrontPath({
        locale,
        pathname: "/legal/public-offer",
        tenantSlug,
      }),
      label: dictionary.footer.publicOffer,
    },
    {
      href: buildStorefrontPath({
        locale,
        pathname: "/legal/personal-data-policy",
        tenantSlug,
      }),
      label: dictionary.footer.personalDataPolicy,
    },
    {
      href: buildStorefrontPath({
        locale,
        pathname: "/legal/personal-data-consent",
        tenantSlug,
      }),
      label: dictionary.footer.personalDataConsent,
    },
  ];

  return (
    <FooterVisibility>
      <footer className="border-border/60 bg-background/80 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 text-sm sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="space-y-1">
            <p className="text-foreground font-medium">{tenantTitle}</p>
            <a
              className="hover:text-foreground transition-colors"
              href={`mailto:${supportEmail}`}
            >
              {supportEmail}
            </a>
          </div>

          <nav
            aria-label={dictionary.footer.documents}
            className="flex flex-col gap-2 lg:items-end"
          >
            <p className="text-foreground/80 text-xs font-semibold tracking-[0.18em] uppercase">
              {dictionary.footer.documents}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 lg:justify-end">
              {legalLinks.map((link) => (
                <Link
                  className="decoration-border hover:text-foreground underline-offset-4 transition hover:underline"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </footer>
    </FooterVisibility>
  );
}
