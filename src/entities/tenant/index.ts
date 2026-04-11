export type {
  CategoryCardVariant,
  ProductCardVariant,
  TenantCatalogConfig,
  TenantConfig,
  TenantSocialLinks,
  TenantTheme,
} from "@/entities/tenant/model/tenant.types";
export { tenantConfigMap, tenantConfigs } from "@/entities/tenant/config/tenant-config";
export { getTenantConfig } from "@/entities/tenant/lib/get-tenant";
