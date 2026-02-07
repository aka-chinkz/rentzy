"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, MapPin, Users, Shield, ArrowRight, Sparkles, Search, MessageCircle, Star, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { itemsAPI } from "@/lib/api";
import { Item } from "@/types";

const features = [
  { icon: MapPin, title: "Location-Based Discovery", description: "Find items available near you.", color: "from-emerald-500 to-teal-500" },
  { icon: Shield, title: "Secure Rentals", description: "Security deposits protect both parties.", color: "from-blue-500 to-cyan-500" },
  { icon: MessageCircle, title: "Direct Communication", description: "Chat directly with owners.", color: "from-violet-500 to-purple-500" },
  { icon: Users, title: "Community Trust", description: "Reviews help you choose wisely.", color: "from-orange-500 to-amber-500" },
];

const categories = [
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "sports", name: "Sports", icon: "⚽" },
  { id: "tools", name: "Tools", icon: "🔧" },
  { id: "cameras", name: "Cameras", icon: "📷" },
  { id: "party", name: "Party", icon: "🎉" },
  { id: "music", name: "Music", icon: "🎸" },
];

export default function HomePage() {
  const { user } = useAuth();
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedItems() {
      try {
        const { data } = await itemsAPI.getItems({ limit: 8, sortBy: "newest" });
        if (data?.items) setFeaturedItems(data.items);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
      setLoading(false);
    }
    fetchFeaturedItems();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -80, 0], y: [0, 60, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-secondary/15 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-full border border-border text-sm text-text-secondary mb-6">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              The future of sharing is here
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-bold mb-6"
          >
            Borrow Anything from{" "}
            <span className="gradient-text">Your Neighbors</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8"
          >
            Why buy when you can borrow? Discover items available for rent in your neighborhood.
            Save money, reduce waste, and connect with your community.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/browse" className="btn-primary flex items-center justify-center gap-2">
              <Search className="w-5 h-5" />
              Browse Items
              <ArrowRight className="w-5 h-5" />
            </Link>
            {!user && (
              <Link href="/auth/signup" className="btn-secondary flex items-center justify-center gap-2">
                Create Account
              </Link>
            )}
            {user && (
              <Link href="/list-item" className="btn-secondary flex items-center justify-center gap-2">
                <Package className="w-5 h-5" />
                List an Item
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How Rentzy Works</h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              A simple, secure way to borrow and lend items in your community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card p-6 text-center group hover:border-accent-primary/30"
              >
                <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-surface/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-display font-bold">Browse Categories</h2>
            <Link href="/browse" className="text-accent-primary hover:text-accent-secondary transition-colors flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  href={`/browse?category=${category.id}`}
                  className="card-hover p-6 text-center block"
                >
                  <span className="text-4xl mb-3 block">{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10" />
            <div className="relative z-10">
              <Star className="w-12 h-12 text-accent-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Start Sharing?
              </h2>
              <p className="text-text-secondary mb-8 max-w-lg mx-auto">
                Join thousands of community members who are saving money and building connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/browse" className="btn-primary">
                  Start Browsing
                </Link>
                {!user && (
                  <Link href="/auth/signup" className="btn-secondary">
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-accent-primary" />
            <span className="font-display font-bold text-xl">Rentzy</span>
          </div>
          <p className="text-text-secondary text-sm">
            © 2026 Rentzy. Connecting communities through sharing.
          </p>
        </div>
      </footer>
    </main>
  );
}
