import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://cediman.example.com"),
  title: "Cediman — Sports Apparel & Gear",
  description:
    "Cediman is your destination for jerseys, lingerie, hats, and shoes. Shop premium sports apparel and gear.",
  openGraph: {
    title: "Cediman — Sports Apparel & Gear",
    description:
      "Shop jerseys, lingerie, hats, and shoes at Cediman. Premium sports apparel and gear.",
    siteName: "Cediman",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Cediman" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cediman — Sports Apparel & Gear",
    description: "Premium sports apparel and gear.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
