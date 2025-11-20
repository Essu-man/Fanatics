import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import CartProvider from "./providers/CartProvider";
import WishlistProvider from "./providers/WishlistProvider";
import SavedForLaterProvider from "./providers/SavedForLaterProvider";
import { ToastProvider } from "./components/ui/ToastContainer";
import MobileBottomNav from "./components/MobileBottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cediman - Premium Football Jerseys",
  description: "Shop authentic football jerseys from your favorite teams. Official licensed jerseys, fast shipping, and fan-first returns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Paystack Inline JS */}
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SavedForLaterProvider>
                <ToastProvider>
                  {children}
                  <MobileBottomNav />
                </ToastProvider>
              </SavedForLaterProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
