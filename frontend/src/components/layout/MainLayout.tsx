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

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-dark-border bg-dark-secondary lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-dark-border px-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary">
                <span className="text-xl font-bold text-white">R</span>
              </div>
              <span className="text-xl font-bold text-white">Rentzy</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "bg-accent-primary/10 text-accent-primary"
                    : "text-dark-muted hover:bg-dark-tertiary hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          {user && (
            <div className="border-t border-dark-border p-4">
              <Link
                href="/notifications"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-muted transition-all hover:bg-dark-tertiary hover:text-white"
              >
                <Bell className="h-5 w-5" />
                Notifications
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-muted transition-all hover:bg-dark-tertiary hover:text-white"
              >
                <User className="h-5 w-5" />
                Profile
              </Link>
              <button
                onClick={() => signOut()}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          )}

          {!user && (
            <div className="border-t border-dark-border p-4">
              <Link
                href="/auth"
                className="flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-3 text-sm font-medium text-white transition-all hover:bg-accent-primary/90"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-dark-border bg-dark-secondary/95 backdrop-blur-lg lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="text-lg font-bold text-white">Rentzy</span>
          </Link>

          <div className="flex items-center gap-2">
            {user && (
              <Link
                href="/notifications"
                className="rounded-lg p-2 text-dark-muted transition-all hover:bg-dark-tertiary hover:text-white"
              >
                <Bell className="h-5 w-5" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-dark-muted transition-all hover:bg-dark-tertiary hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-dark-border bg-dark-secondary p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "text-dark-muted hover:bg-dark-tertiary hover:text-white"
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
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-dark-muted transition-all hover:bg-dark-tertiary hover:text-white"
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-3 text-sm font-medium text-white transition-all hover:bg-accent-primary/90"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-dark-border bg-dark-secondary/95 backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
                isActive(item.href)
                  ? "text-accent-primary"
                  : "text-dark-muted hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen pb-20 pt-16 lg:ml-64 lg:pb-0 lg:pt-0">
        <div className="mx-auto max-w-7xl p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
