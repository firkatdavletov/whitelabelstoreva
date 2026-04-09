import type { Metadata } from "next";

import { getSerializedPublicEnvScript } from "@/shared/config/env";

import "./styles/globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description: "White label storefront starter for food ordering.",
  title: "White Label Storefront",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      lang="en"
    >
      <body className="min-h-full">
        <script
          dangerouslySetInnerHTML={{ __html: getSerializedPublicEnvScript() }}
          id="storeva-public-env"
        />
        {children}
      </body>
    </html>
  );
}
