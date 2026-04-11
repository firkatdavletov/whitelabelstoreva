import { getSerializedPublicEnvScript } from "@/shared/config/env";
import { AnalyticsPageTracker } from "@/shared/analytics/analytics-page-tracker";
import { AnalyticsScripts } from "@/shared/analytics/analytics-scripts";
import { createSiteMetadata } from "@/shared/lib/storefront-metadata";

import "./styles/globals.css";

export const dynamic = "force-dynamic";

export const metadata = createSiteMetadata();

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
        <AnalyticsPageTracker />
        {children}
        <AnalyticsScripts />
      </body>
    </html>
  );
}
