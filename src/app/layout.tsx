import type { Metadata } from "next";
import { Outfit, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Rentzy - Borrow & Rent from Your Community",
  description:
    "Discover and rent items from people near you. No buying, just borrowing. Save money, reduce waste, build community.",
  keywords: ["rent", "borrow", "sharing economy", "community", "sustainable"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans">
        <AuthProvider>
          <LocationProvider>
            <div className="relative min-h-screen">
              {/* Background effects */}
              <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
              <div className="fixed inset-0 bg-radial-glow pointer-events-none" />
              
              {/* Main content */}
              <div className="relative z-10">{children}</div>
            </div>
            
            {/* Toast notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "glass text-text-primary",
                duration: 4000,
                style: {
                  background: "rgba(26, 26, 36, 0.95)",
                  color: "#f8fafc",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  backdropFilter: "blur(20px)",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#f8fafc",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#f8fafc",
                  },
                },
              }}
            />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
