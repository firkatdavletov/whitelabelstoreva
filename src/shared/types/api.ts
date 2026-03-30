export type ApiMethod = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

export type ApiQueryValue = boolean | number | string | undefined;

export type ApiQueryParams = Record<string, ApiQueryValue>;

export type ApiErrorPayload = {
  error: string;
  message: string;
  statusCode: number;
};
