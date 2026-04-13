import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  getLegalDocument,
  isLegalDocumentType,
  LEGAL_DOCUMENT_TYPES,
} from "@/entities/legal-document";
import { resolveLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { ApiError } from "@/shared/api";
import {
  buildStorefrontPath,
  getRequestHostnameFromHeaders,
} from "@/shared/config/routing";
import { getDictionary } from "@/shared/i18n/dictionary";
import type { Locale, RouteParams } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

type LegalDocumentPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
    type: string;
  }>;
};

export function generateStaticParams() {
  return LEGAL_DOCUMENT_TYPES.map((type) => ({ type }));
}

function formatUpdatedAt(value: string, locale: Locale) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default async function LegalDocumentPage({
  params,
}: LegalDocumentPageProps) {
  const { locale, tenant, type } = await params;
  const resolvedLocale = resolveLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!resolvedLocale || !tenantConfig || !isLegalDocumentType(type)) {
    notFound();
  }

  const dictionary = await getDictionary(resolvedLocale);

  try {
    const document = await getLegalDocument(type);
    const requestHostname = getRequestHostnameFromHeaders(await headers());
    const storefrontHref = buildStorefrontPath({
      hostname: requestHostname,
      locale: resolvedLocale,
      tenantSlug: tenantConfig.slug,
    });

    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="space-y-3">
          <Badge>{dictionary.legalDocuments.badge}</Badge>
          <h1 className="font-heading text-4xl font-semibold text-balance">
            {document.title}
          </h1>
          {document.subtitle ? (
            <p className="text-muted-foreground max-w-3xl text-sm sm:text-base">
              {document.subtitle}
            </p>
          ) : null}
          <p className="text-muted-foreground text-sm">
            {dictionary.legalDocuments.updatedAt}:{" "}
            {formatUpdatedAt(document.updatedAt, resolvedLocale)}
          </p>
        </div>

        <Card className="rounded-3xl border-white/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--card)_95%,white),color-mix(in_srgb,var(--secondary)_44%,white))]">
          <CardHeader className="border-border/55 border-b">
            <CardTitle className="text-xl sm:text-2xl">
              {document.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pt-6 pb-6 sm:px-8">
            <div className="text-sm leading-7 whitespace-pre-wrap sm:text-base">
              {document.text}
            </div>
          </CardContent>
        </Card>

        <div>
          <Button asChild variant="outline">
            <Link href={storefrontHref}>
              {dictionary.legalDocuments.backToStorefront}
            </Link>
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 400) {
      notFound();
    }

    throw error;
  }
}
