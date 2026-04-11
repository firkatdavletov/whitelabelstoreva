import { z } from "zod";

import type { Locale } from "@/shared/types/common";

const publicEnvKeys = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_API_MOCKING",
  "NEXT_PUBLIC_DEFAULT_LOCALE",
  "NEXT_PUBLIC_DEFAULT_TENANT",
  "NEXT_PUBLIC_GA_ID",
  "NEXT_PUBLIC_META_PIXEL_ID",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_YANDEX_MAPS_API_KEY",
  "NEXT_PUBLIC_YANDEX_METRIKA_ID",
] as const;

type PublicEnvKey = (typeof publicEnvKeys)[number];

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8080/api"),
  NEXT_PUBLIC_API_MOCKING: z.enum(["disabled", "enabled"]).default("enabled"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["en", "ru"]).default("en"),
  NEXT_PUBLIC_DEFAULT_TENANT: z.string().min(1).default("urban-bites"),
  NEXT_PUBLIC_GA_ID: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().trim().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_YANDEX_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_YANDEX_METRIKA_ID: z.string().trim().min(1).optional(),
});

type PublicEnv = z.infer<typeof publicEnvSchema>;
type PublicEnvSource = Partial<Record<PublicEnvKey, string | undefined>>;

const PUBLIC_ENV_WINDOW_KEY = "__STOREVA_PUBLIC_ENV__";

let cachedBrowserEnv: PublicEnv | null = null;
let cachedServerEnv: PublicEnv | null = null;

function validatePublicEnv(source: PublicEnvSource) {
  const parsedEnv = publicEnvSchema.safeParse(source);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid public environment configuration: ${parsedEnv.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ")}`,
    );
  }

  return parsedEnv.data;
}

function readServerPublicEnv(): PublicEnvSource {
  return Object.fromEntries(
    publicEnvKeys.map((key) => [key, process.env[key]]),
  ) as PublicEnvSource;
}

function readBrowserPublicEnv(): PublicEnvSource {
  if (typeof window === "undefined") {
    return {};
  }

  return (window[PUBLIC_ENV_WINDOW_KEY] ?? {}) as PublicEnvSource;
}

function getValidatedPublicEnv() {
  if (typeof window === "undefined") {
    cachedServerEnv ??= validatePublicEnv(readServerPublicEnv());
    return cachedServerEnv;
  }

  cachedBrowserEnv ??= validatePublicEnv(readBrowserPublicEnv());
  return cachedBrowserEnv;
}

function getPublicEnvValue<Key extends keyof PublicEnv>(key: Key) {
  return getValidatedPublicEnv()[key];
}

export function getPublicEnv() {
  return getValidatedPublicEnv();
}

export function getSerializedPublicEnvScript() {
  return `window.${PUBLIC_ENV_WINDOW_KEY} = ${JSON.stringify(getPublicEnv()).replace(/</g, "\\u003c")};`;
}

export const env = {
  get NEXT_PUBLIC_API_BASE_URL() {
    return getPublicEnvValue("NEXT_PUBLIC_API_BASE_URL");
  },
  get NEXT_PUBLIC_API_MOCKING() {
    return getPublicEnvValue("NEXT_PUBLIC_API_MOCKING");
  },
  get NEXT_PUBLIC_DEFAULT_LOCALE() {
    return getPublicEnvValue("NEXT_PUBLIC_DEFAULT_LOCALE");
  },
  get NEXT_PUBLIC_DEFAULT_TENANT() {
    return getPublicEnvValue("NEXT_PUBLIC_DEFAULT_TENANT");
  },
  get NEXT_PUBLIC_GA_ID() {
    return getPublicEnvValue("NEXT_PUBLIC_GA_ID");
  },
  get NEXT_PUBLIC_META_PIXEL_ID() {
    return getPublicEnvValue("NEXT_PUBLIC_META_PIXEL_ID");
  },
  get NEXT_PUBLIC_SITE_URL() {
    return getPublicEnvValue("NEXT_PUBLIC_SITE_URL");
  },
  get NEXT_PUBLIC_YANDEX_MAPS_API_KEY() {
    return getPublicEnvValue("NEXT_PUBLIC_YANDEX_MAPS_API_KEY");
  },
  get NEXT_PUBLIC_YANDEX_METRIKA_ID() {
    return getPublicEnvValue("NEXT_PUBLIC_YANDEX_METRIKA_ID");
  },
  get apiMocksEnabled() {
    return getPublicEnvValue("NEXT_PUBLIC_API_MOCKING") === "enabled";
  },
  get defaultLocale() {
    return getPublicEnvValue("NEXT_PUBLIC_DEFAULT_LOCALE") as Locale;
  },
} as const;
