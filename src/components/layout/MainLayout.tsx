"use client";

import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Main content with padding for fixed nav */}
      <main className="pt-14 pb-20 md:pt-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
