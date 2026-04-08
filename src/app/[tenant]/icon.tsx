import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

import { resolveTenant } from "@/processes/bootstrap-tenant/lib/resolve-tenant";

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

type TenantIconProps = {
  params: Promise<{
    tenant: string;
  }>;
};

function resolveIconPath(iconUrl: string) {
  return join(process.cwd(), "public", iconUrl.replace(/^\/+/, ""));
}

function resolveContentType(iconUrl: string) {
  return CONTENT_TYPE_BY_EXTENSION[extname(iconUrl).toLowerCase()] ?? "image/x-icon";
}

export default async function Icon({ params }: TenantIconProps) {
  const { tenant } = await params;
  const tenantConfig = resolveTenant(tenant);

  if (!tenantConfig?.faviconUrl) {
    return new Response(null, { status: 404 });
  }

  try {
    const icon = await readFile(resolveIconPath(tenantConfig.faviconUrl));

    return new Response(icon, {
      headers: {
        "Cache-Control": "public, max-age=0, must-revalidate",
        "Content-Type": resolveContentType(tenantConfig.faviconUrl),
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
