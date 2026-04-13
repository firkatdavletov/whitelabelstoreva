import Link from "next/link";
import { headers } from "next/headers";

import type { TenantSocialLinks } from "@/entities/tenant";
import {
  buildStorefrontPath,
  getRequestHostnameFromHeaders,
} from "@/shared/config/routing";
import { getDictionary } from "@/shared/i18n/dictionary";
import type { Locale } from "@/shared/types/common";
import { FooterVisibility } from "@/widgets/footer/ui/footer-visibility";

type FooterProps = {
  locale: Locale;
  socialLinks: TenantSocialLinks;
  supportEmail: string;
  tenantSlug: string;
  tenantTitle: string;
};

export async function Footer({
  locale,
  socialLinks,
  supportEmail,
  tenantSlug,
  tenantTitle,
}: FooterProps) {
  const dictionary = await getDictionary(locale);
  const requestHostname = getRequestHostnameFromHeaders(await headers());
  const legalLinks = [
    {
      href: buildStorefrontPath({
        hostname: requestHostname,
        locale,
        pathname: "/legal/public-offer",
        tenantSlug,
      }),
      label: dictionary.footer.publicOffer,
    },
    {
      href: buildStorefrontPath({
        hostname: requestHostname,
        locale,
        pathname: "/legal/personal-data-policy",
        tenantSlug,
      }),
      label: dictionary.footer.personalDataPolicy,
    },
    {
      href: buildStorefrontPath({
        hostname: requestHostname,
        locale,
        pathname: "/legal/personal-data-consent",
        tenantSlug,
      }),
      label: dictionary.footer.personalDataConsent,
    },
  ];
  const contactLinks = [
    {
      href: socialLinks.max?.trim(),
      label: "Max",
    },
    {
      href: socialLinks.telegram?.trim(),
      label: "Telegram",
    },
    {
      href: socialLinks.instagram?.trim(),
      label: "Instagram",
    },
  ].filter((link): link is { href: string; label: string } =>
    Boolean(link.href),
  );

  return (
    <FooterVisibility>
      <footer className="border-border/60 bg-background/80 border-t">
        <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 text-sm sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-foreground font-medium">{tenantTitle}</p>
              <a
                className="hover:text-foreground transition-colors"
                href={`mailto:${supportEmail}`}
              >
                {supportEmail}
              </a>
            </div>

            {contactLinks.length > 0 ? (
              <div className="space-y-2">
                <p className="text-foreground/80 text-xs font-semibold tracking-[0.18em] uppercase">
                  {dictionary.footer.socials}
                </p>
                <div className="flex flex-wrap gap-2">
                  {contactLinks.map((link) => (
                    <a
                      className="border-border/70 bg-card hover:text-foreground hover:border-border inline-flex items-center rounded-full border px-3 py-1.5 text-sm transition-colors"
                      href={link.href}
                      key={link.label}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
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
