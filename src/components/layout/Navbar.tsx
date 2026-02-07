"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
  Menu,
  X,
  MapPin,
  Bell,
  LogOut,
  Settings,
  Package,
  Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { Avatar, Button } from "@/components/ui";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/browse", icon: Search, label: "Browse" },
  { href: "/list-item", icon: PlusCircle, label: "List Item" },
  { href: "/messages", icon: MessageCircle, label: "Messages" },
  { href: "/profile", icon: User, label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { locationName, requestLocation, loading: locationLoading } = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 hidden md:block">
        <div className="glass border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="font-display text-xl font-bold gradient-text">
                  Rentzy
                </span>
              </Link>

              {/* Location */}
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-surface transition-colors"
              >
                <MapPin className="w-4 h-4 text-accent-primary" />
                <span className="text-sm text-text-secondary">
                  {locationLoading
                    ? "Getting location..."
                    : locationName || "Set your location"}
                </span>
              </button>

              {/* Navigation Links */}
              <div className="flex items-center gap-1">
                {navItems.slice(0, 3).map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl transition-all
                        ${
                          isActive
                            ? "bg-accent-primary/20 text-accent-primary"
                            : "text-text-secondary hover:text-text-primary hover:bg-surface"
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    {/* Messages */}
                    <Link
                      href="/messages"
                      className="relative p-2 rounded-xl hover:bg-surface transition-colors"
                    >
                      <MessageCircle className="w-5 h-5 text-text-secondary" />
                      {/* Notification dot */}
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-primary" />
                    </Link>

                    {/* Notifications */}
                    <Link
                      href="/notifications"
                      className="relative p-2 rounded-xl hover:bg-surface transition-colors"
                    >
                      <Bell className="w-5 h-5 text-text-secondary" />
                    </Link>

                    {/* Profile dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface transition-colors"
                      >
                        <Avatar
                          src={profile?.avatar_url}
                          alt={profile?.full_name || "User"}
                          size="sm"
                        />
                      </button>

                      <AnimatePresence>
                        {showProfileMenu && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setShowProfileMenu(false)}
                              className="fixed inset-0 z-40"
                            />
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 top-full mt-2 w-56 glass rounded-xl shadow-glass overflow-hidden z-50"
                            >
                              <div className="p-4 border-b border-border">
                                <p className="font-medium text-text-primary">
                                  {profile?.full_name || "User"}
                                </p>
                                <p className="text-sm text-text-muted">
                                  {profile?.email}
                                </p>
                              </div>
                              <div className="p-2">
                                <Link
                                  href="/profile"
                                  onClick={() => setShowProfileMenu(false)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
                                >
                                  <User className="w-4 h-4" />
                                  <span className="text-sm">My Profile</span>
                                </Link>
                                <Link
                                  href="/my-items"
                                  onClick={() => setShowProfileMenu(false)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
                                >
                                  <Package className="w-4 h-4" />
                                  <span className="text-sm">My Items</span>
                                </Link>
                                <Link
                                  href="/saved"
                                  onClick={() => setShowProfileMenu(false)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
                                >
                                  <Heart className="w-4 h-4" />
                                  <span className="text-sm">Saved Items</span>
                                </Link>
                                <Link
                                  href="/settings"
                                  onClick={() => setShowProfileMenu(false)}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-text-primary"
                                >
                                  <Settings className="w-4 h-4" />
                                  <span className="text-sm">Settings</span>
                                </Link>
                              </div>
                              <div className="p-2 border-t border-border">
                                <button
                                  onClick={handleSignOut}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface transition-colors text-error w-full"
                                >
                                  <LogOut className="w-4 h-4" />
                                  <span className="text-sm">Sign Out</span>
                                </button>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="glass border-t border-border">
          <div className="flex items-center justify-around h-16 px-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={user ? item.href : item.href === "/" ? "/" : "/auth/login"}
                  className="flex flex-col items-center gap-1 py-2"
                >
                  <div
                    className={`
                      p-2 rounded-xl transition-all
                      ${
                        isActive
                          ? "bg-accent-primary/20 text-accent-primary"
                          : "text-text-muted"
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs ${
                      isActive ? "text-accent-primary" : "text-text-muted"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 md:hidden">
        <div className="glass border-b border-border">
          <div className="flex items-center justify-between h-14 px-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold gradient-text">
                Rentzy
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-sm"
              >
                <MapPin className="w-4 h-4 text-accent-primary" />
                <span className="text-text-secondary max-w-[100px] truncate">
                  {locationLoading
                    ? "..."
                    : locationName || "Location"}
                </span>
              </button>

              {user && (
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <Bell className="w-5 h-5 text-text-secondary" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-primary" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
