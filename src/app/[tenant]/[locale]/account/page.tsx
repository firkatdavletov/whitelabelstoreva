import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import {
  buildStorefrontPath,
  getRequestHostnameFromHeaders,
} from "@/shared/config/routing";
import {
  createNonIndexableStorefrontMetadata,
  nonIndexableMetadata,
} from "@/shared/lib/storefront-metadata";
import type { RouteParams } from "@/shared/types/common";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

type AccountPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export async function generateMetadata({
  params,
}: AccountPageProps): Promise<Metadata> {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    return nonIndexableMetadata;
  }

  return createNonIndexableStorefrontMetadata({
    description: localeContext.dictionary.account.subtitle,
    locale: localeContext.locale,
    pathname: "/account",
    tenantConfig,
    title: `${localeContext.dictionary.account.title} | ${tenantConfig.title}`,
  });
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  const requestHostname = getRequestHostnameFromHeaders(await headers());

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-3">
        <Badge>{tenantConfig.title}</Badge>
        <h1 className="font-heading text-4xl font-semibold">
          {localeContext.dictionary.account.title}
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm">
          {localeContext.dictionary.account.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{localeContext.dictionary.account.cardTitle}</CardTitle>
          <CardDescription>
            {localeContext.dictionary.account.cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link
              href={buildStorefrontPath({
                hostname: requestHostname,
                locale: localeContext.locale,
                tenantSlug: tenantConfig.slug,
              })}
            >
              {localeContext.dictionary.account.openStorefront}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
