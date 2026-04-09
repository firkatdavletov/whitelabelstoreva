import { redirect } from "next/navigation";

import { DEFAULT_LOCALE, DEFAULT_TENANT, buildStorefrontPath } from "@/shared/config/routing";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  redirect(
    buildStorefrontPath({
      locale: DEFAULT_LOCALE,
      tenantSlug: DEFAULT_TENANT,
    }),
  );
}
