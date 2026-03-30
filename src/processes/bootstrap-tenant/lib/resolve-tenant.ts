import { getTenantConfig } from "@/entities/tenant";

export function resolveTenant(tenantSlug: string) {
  return getTenantConfig(tenantSlug);
}
