import type { ApiErrorPayload } from "@/shared/types/api";

export class ApiError extends Error {
  readonly payload?: ApiErrorPayload;

  readonly statusCode: number;

  constructor(message: string, statusCode: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.payload = payload;
    this.statusCode = statusCode;
  }
}
