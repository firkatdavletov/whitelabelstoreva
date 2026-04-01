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
    <html
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      lang="en"
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
