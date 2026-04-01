import Link from "next/link";
import { notFound } from "next/navigation";

import { bootstrapLocale } from "@/processes/bootstrap-locale/lib/resolve-locale";
import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";
import { buildStorefrontPath } from "@/shared/config/routing";
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

type SearchPageProps = {
  params: RouteParams<{
    locale: string;
    tenant: string;
  }>;
};

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale, tenant } = await params;
  const localeContext = await bootstrapLocale(locale);
  const tenantConfig = resolveTenant(tenant);

  if (!localeContext || !tenantConfig) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="space-y-3">
        <Badge>{tenantConfig.title}</Badge>
        <h1 className="font-heading text-4xl font-semibold">
          {localeContext.dictionary.search.title}
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm">
          {localeContext.dictionary.search.subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{localeContext.dictionary.search.cardTitle}</CardTitle>
          <CardDescription>
            {localeContext.dictionary.search.cardDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link
              href={buildStorefrontPath({
                locale: localeContext.locale,
                pathname: "/menu",
                tenantSlug: tenantConfig.slug,
              })}
            >
              {localeContext.dictionary.search.openMenu}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
