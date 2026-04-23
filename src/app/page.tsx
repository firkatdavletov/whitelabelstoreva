import { permanentRedirect } from "next/navigation";

import {
  DEFAULT_LOCALE,
  DEFAULT_TENANT,
  buildStorefrontPath,
} from "@/shared/config/routing";

export const dynamic = "force-dynamic";

export default function IndexPage() {
  permanentRedirect(
    buildStorefrontPath({
      locale: DEFAULT_LOCALE,
      tenantSlug: DEFAULT_TENANT,
    }),
  );
}
