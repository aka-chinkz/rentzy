import type { Metadata } from "next";
import { Outfit, Space_Grotesk } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import { LocationProvider } from "@/contexts/LocationContext";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rentzy - Borrow & Rent from Your Community",
  description: "Discover and rent items from people in your neighborhood. Save money, reduce waste, and build community connections.",
  keywords: ["rental", "borrow", "community", "sharing economy", "peer-to-peer"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <LocationProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#1a1a24",
                  color: "#fff",
                  border: "1px solid #2a2a3a",
                  borderRadius: "12px",
                  padding: "16px",
                },
                success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
