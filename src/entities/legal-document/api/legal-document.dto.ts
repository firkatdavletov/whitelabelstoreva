import type { components } from "@/shared/api/generated/schema";

export type LegalDocumentDto = components["schemas"]["LegalDocumentResponse"];

export type LegalDocumentType = components["schemas"]["LegalDocumentType"];

export const LEGAL_DOCUMENT_TYPES = [
  "public-offer",
  "personal-data-consent",
  "personal-data-policy",
] as const satisfies ReadonlyArray<LegalDocumentType>;

export function isLegalDocumentType(value: string): value is LegalDocumentType {
  return LEGAL_DOCUMENT_TYPES.includes(value as LegalDocumentType);
}
