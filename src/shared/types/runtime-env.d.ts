declare global {
  interface Window {
    __STOREVA_PUBLIC_ENV__?: Record<string, string | undefined>;
  }
}

export {};
