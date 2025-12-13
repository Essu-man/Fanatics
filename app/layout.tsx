import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import CartProvider from "./providers/CartProvider";
import WishlistProvider from "./providers/WishlistProvider";
import SavedForLaterProvider from "./providers/SavedForLaterProvider";
import { ToastProvider } from "./components/ui/ToastContainer";
import MobileBottomNav from "./components/MobileBottomNav";

// Removed Google Fonts during build to avoid external fetch errors.
// Use system fonts via CSS in globals.css.

export const metadata: Metadata = {
  title: "Cediman - Premium Football Jerseys",
  description: "Shop authentic football jerseys from your favorite teams. Official licensed jerseys, fast delivery, and fan-first returns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
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
