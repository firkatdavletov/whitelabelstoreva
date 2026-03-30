"use client";

import { Toaster } from "sonner";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      toastOptions={{
        classNames: {
          description: "!text-muted-foreground",
          title: "!text-foreground",
          toast: "!border-border !bg-card !text-foreground",
        },
      }}
    />
  );
}
