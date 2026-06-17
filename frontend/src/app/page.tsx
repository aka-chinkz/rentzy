"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Package,
  MapPin,
  Users,
  Shield,
  Sparkles,
  Search,
  MessageCircle,
  ArrowRight,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Hero3DHover } from "@/components/Hero3DHover";
import { RecentlyVisited } from "@/components/items/RecentlyVisited";
import { CategoryBento } from "@/components/items/CategoryBento";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: MapPin, title: "Location-Based Discovery", description: "Find items available near you." },
  { icon: Shield, title: "Secure Rentals", description: "Security deposits protect both parties." },
  { icon: MessageCircle, title: "Direct Communication", description: "Chat directly with owners." },
  { icon: Users, title: "Community Trust", description: "Reviews help you choose wisely." },
];

export default function HomePage() {
  const { user } = useAuth();
  const heroScrollRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroScrollRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(heroScrollProgress, [0, 0.85], [1, 0]);
  const heroScale = useTransform(heroScrollProgress, [0, 1], [1, 0.86]);
  const heroY = useTransform(heroScrollProgress, [0, 1], [0, 100]);
  const heroBlur = useTransform(heroScrollProgress, [0, 0.8], [0, 10]);
  const heroFilter = useTransform(heroBlur, (v) => `blur(${v}px)`);
  const ctaOpacity = useTransform(heroScrollProgress, [0, 0.45, 0.75], [1, 0.5, 0]);

  return (
    <MainLayout>
      <div className="relative min-h-screen">
        {/* Hero only — scroll transition */}
        <section ref={heroScrollRef} className="relative -mx-4 h-[175vh] lg:-mx-8">
          <motion.div
            className="sticky top-14 flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 py-10 lg:top-16 lg:min-h-[calc(100vh-4rem)] md:py-14"
            style={{
              opacity: heroOpacity,
              scale: heroScale,
              y: heroY,
              filter: heroFilter,
            }}
          >
            <div className="relative z-10 mx-auto w-full max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
              >
                <Hero3DHover
                  title="Borrow Anything from"
                  highlight="Your Neighbors"
                  subtitle="Why buy when you can borrow? Discover items available for rent in your neighborhood. Save money, reduce waste, and connect with your community."
                  scrollProgress={heroScrollProgress}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-10 flex flex-col items-center"
                style={{ opacity: ctaOpacity }}
              >
                <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm text-text-secondary">
                  <Sparkles className="h-4 w-4 text-accent-primary" />
                  Scroll to explore — hover for 3D
                </span>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/browse" className="btn-17 btn-17-primary">
                    <span className="text-container">
                      <span className="text">
                        <Search className="w-5 h-5" />
                        Browse Items
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    </span>
                  </Link>
                  {!user && (
                    <Link href="/auth/signup" className="btn-17">
                      <span className="text-container">
                        <span className="text">Create Account</span>
                      </span>
                    </Link>
                  )}
                  {user && (
                    <Link href="/list-item" className="btn-17">
                      <span className="text-container">
                        <span className="text">
                          <Package className="w-5 h-5" />
                          List an Item
                        </span>
                      </span>
                    </Link>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-24">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold md:text-4xl">How Rentzy Works</h2>
            <p className="mx-auto max-w-2xl text-text-secondary">
              A simple, secure way to borrow and lend items in your community
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card card-scale-hover group p-6 text-center hover:border-border-subtle"
              >
                <div className="card-content">
                  <div className="card-image mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface-elevated">
                    <feature.icon className="h-6 w-6 text-accent-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-text-secondary">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <RecentlyVisited />

        <CategoryBento />

        {/* Footer */}
        <footer className="-mx-4 border-t border-border bg-background px-4 py-12 lg:-mx-8 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Package className="h-6 w-6 text-accent-primary" />
              <span className="font-display text-xl font-bold">Rentzy</span>
            </div>
            <p className="text-sm text-text-secondary">
              © 2026 Rentzy. Connecting communities through sharing.
            </p>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}
