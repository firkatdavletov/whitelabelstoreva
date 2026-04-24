import { afterEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "@/shared/api";
import { InvalidJsonResponseError, safeJson } from "@/shared/lib/safe-json";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("safeJson", () => {
  it("throws a diagnostic error for invalid JSON responses", async () => {
    const response = new Response("null<!doctype html>", {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
      status: 502,
    });

    await expect(safeJson(response)).rejects.toMatchObject({
      contentType: "text/html; charset=utf-8",
      name: "InvalidJsonResponseError",
      preview: "null<!doctype html>",
      statusCode: 502,
    } satisfies Partial<InvalidJsonResponseError>);
  });
});

describe("apiRequest", () => {
  it("converts invalid JSON API responses into ApiError", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response("null<!doctype html>", {
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
          status: 502,
        });
      }),
    );

    await expect(apiRequest("/v1/catalog/products")).rejects.toMatchObject({
      name: "ApiError",
      payload: {
        error: "INVALID_JSON_RESPONSE",
        statusCode: 502,
      },
      statusCode: 502,
    });
  });
});
