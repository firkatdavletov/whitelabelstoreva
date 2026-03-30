import type { Metadata } from "next";
import "./styles/globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
