import { tenantConfigMap } from "@/entities/tenant/config/tenant-config";

export function getTenantConfig(slug: string) {
  return tenantConfigMap[slug as keyof typeof tenantConfigMap] ?? null;
}
