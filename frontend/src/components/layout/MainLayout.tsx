"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
  Bell,
  Heart,
  LogOut,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/browse", icon: Search, label: "Browse" },
    { href: "/list-item", icon: PlusCircle, label: "List Item" },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/saved", icon: Heart, label: "Saved" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isHomePage = pathname === "/";

  const navbarItems = [
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/saved", icon: Heart, label: "Saved" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar - Desktop (sticky, always visible on scroll) */}
      <header className="fixed left-0 right-0 top-0 z-50 hidden lg:block bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex h-16 items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary">
              <span className="text-sm font-semibold text-white">R</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-text-primary">Rentzy</span>
          </Link>
          <nav className="flex flex-1 items-center justify-center gap-8">
            {navbarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative cursor-pointer overflow-hidden rounded-lg py-2 px-4 text-sm font-medium transition-all duration-300 ease-in-out ${
                  isActive(item.href)
                    ? "text-text-primary font-semibold"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <span className="relative z-20">{item.label}</span>
                <span
                  className="absolute left-[-75%] top-0 h-full w-[50%] rotate-12 bg-white/20 blur-lg transition-all duration-1000 ease-in-out group-hover:left-[125%] z-10"
                  aria-hidden
                />
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-6">
            {user ? (
              <button
                onClick={() => signOut()}
                className="group relative cursor-pointer overflow-hidden rounded-lg py-2 px-4 text-sm font-medium text-text-muted transition-all duration-300 ease-in-out hover:text-text-primary"
              >
                <span className="relative z-20">Sign Out</span>
                <span
                  className="absolute left-[-75%] top-0 h-full w-[50%] rotate-12 bg-white/20 blur-lg transition-all duration-1000 ease-in-out group-hover:left-[125%] z-10"
                  aria-hidden
                />
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - hidden on home page */}
      {!isHomePage && (
      <aside className="fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-border bg-surface lg:block">
        <div className="flex h-full flex-col">
          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-accent-primary/15 text-accent-primary"
                    : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      )}

      {/* Mobile Header / Navbar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary">
              <span className="text-sm font-semibold text-white">R</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-text-primary">Rentzy</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/messages"
              className={`rounded-lg p-2.5 transition-all ${isActive("/messages") ? "text-accent-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}
            >
              <MessageCircle className="h-5 w-5" />
            </Link>
            <Link
              href="/saved"
              className={`rounded-lg p-2.5 transition-all ${isActive("/saved") ? "text-accent-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}
            >
              <Heart className="h-5 w-5" />
            </Link>
            {user && (
              <Link
                href="/notifications"
                className={`rounded-lg p-2.5 transition-all ${isActive("/notifications") ? "text-accent-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}
              >
                <Bell className="h-5 w-5" />
              </Link>
            )}
            {user ? (
              <Link
                href="/profile"
                className={`rounded-lg p-2.5 transition-all ${isActive("/profile") ? "text-accent-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}
              >
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-lg bg-accent-primary px-3 py-2 text-sm font-medium text-white"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2.5 text-text-muted transition-all hover:bg-surface-elevated hover:text-text-primary"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-surface p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "bg-accent-primary/15 text-accent-primary"
                      : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-muted transition-all hover:bg-surface-elevated hover:text-text-primary"
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-error transition-all hover:bg-error/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent-primary/90"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
                isActive(item.href)
                  ? "text-accent-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className={`min-h-screen pb-20 pt-14 lg:pt-16 ${!isHomePage ? "lg:ml-64" : ""}`}>
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
