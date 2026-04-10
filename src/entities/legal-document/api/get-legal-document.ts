import type {
  LegalDocumentDto,
  LegalDocumentType,
} from "@/entities/legal-document/api/legal-document.dto";
import { apiRequest } from "@/shared/api";

export async function getLegalDocument(type: LegalDocumentType) {
  return apiRequest<LegalDocumentDto>(`/v1/public/legal-documents/${type}`, {
    cache: "no-store",
  });
}
