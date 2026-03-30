import { z } from "zod";

import type { Locale } from "@/shared/types/common";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8080/api"),
  NEXT_PUBLIC_API_MOCKING: z.enum(["disabled", "enabled"]).default("enabled"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["en", "ru"]).default("en"),
  NEXT_PUBLIC_DEFAULT_TENANT: z.string().min(1).default("urban-bites"),
});

const parsedEnv = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  NEXT_PUBLIC_DEFAULT_TENANT: process.env.NEXT_PUBLIC_DEFAULT_TENANT,
});

if (!parsedEnv.success) {
  throw new Error(
    `Invalid public environment configuration: ${parsedEnv.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ")}`,
  );
}

export const env = {
  ...parsedEnv.data,
  apiMocksEnabled: parsedEnv.data.NEXT_PUBLIC_API_MOCKING === "enabled",
  defaultLocale: parsedEnv.data.NEXT_PUBLIC_DEFAULT_LOCALE as Locale,
};
