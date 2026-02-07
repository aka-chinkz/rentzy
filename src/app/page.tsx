"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  MapPin,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  Search,
  MessageCircle,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { MainLayout } from "@/components/layout/MainLayout";
import { ItemCard } from "@/components/items/ItemCard";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "@/contexts/LocationContext";
import { Item, Profile, Category } from "@/types";
import { createClient } from "@/lib/supabase/client";

const features = [
  {
    icon: MapPin,
    title: "Location-Based Discovery",
    description: "Find items available near you. Browse by distance and pick up locally.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Shield,
    title: "Secure Rentals",
    description: "Security deposits protect both parties. Rating system builds trust.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with owners to arrange pickup and discuss details.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Community Trust",
    description: "Reviews and ratings help you choose reliable renters and owners.",
    color: "from-orange-500 to-amber-500",
  },
];

const categories = [
  { name: "Electronics", icon: "💻", slug: "electronics" },
  { name: "Sports & Outdoors", icon: "⚽", slug: "sports" },
  { name: "Tools & Equipment", icon: "🔧", slug: "tools" },
  { name: "Cameras & Photo", icon: "📷", slug: "cameras" },
  { name: "Party & Events", icon: "🎉", slug: "party" },
  { name: "Music & Audio", icon: "🎸", slug: "music" },
  { name: "Books & Media", icon: "📚", slug: "books" },
  { name: "Fashion", icon: "👗", slug: "fashion" },
];

const howItWorks = [
  {
    step: 1,
    title: "Browse & Discover",
    description: "Search for items near you by category, price, or distance.",
  },
  {
    step: 2,
    title: "Request to Rent",
    description: "Send a rental request with your preferred dates and message.",
  },
  {
    step: 3,
    title: "Get Approved",
    description: "Owner reviews your request and approves or suggests alternatives.",
  },
  {
    step: 4,
    title: "Pick Up & Enjoy",
    description: "Meet the owner, pay the deposit, and enjoy your rental!",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { location, locationName, requestLocation } = useLocation();
  const [featuredItems, setFeaturedItems] = useState<(Item & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchFeaturedItems() {
      const { data, error } = await supabase
        .from("items")
        .select("*, owner:profiles(*)")
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        setFeaturedItems(data as any);
      }
      setLoading(false);
    }

    fetchFeaturedItems();
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-primary/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-tertiary/15 rounded-full blur-[120px]"
          />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
            >
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span className="text-sm text-text-secondary">
                The sharing economy for your neighborhood
              </span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6">
              <span className="text-text-primary">Borrow.</span>
              <br />
              <span className="animated-gradient-text">Rent.</span>
              <br />
              <span className="text-text-primary">Share.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto mb-10">
              Why buy when you can borrow? Discover items from people near you.
              Save money, reduce waste, build community.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/browse">
                <Button size="lg" icon={<Search className="w-5 h-5" />}>
                  Start Browsing
                </Button>
              </Link>
              <Link href="/list-item">
                <Button
                  size="lg"
                  variant="secondary"
                  icon={<Package className="w-5 h-5" />}
                >
                  List an Item
                </Button>
              </Link>
            </div>

            {/* Location prompt */}
            {!location && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10"
              >
                <button
                  onClick={requestLocation}
                  className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Enable location to find items near you</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {location && locationName && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-10"
              >
                <div className="inline-flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-accent-primary" />
                  <span>Showing items near {locationName}</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-text-muted flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-text-muted"
            />
          </div>
        </motion.div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              Browse by Category
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              From electronics to outdoor gear, find exactly what you need
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category, i) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/browse?category=${category.slug}`}>
                  <Card variant="interactive" padding="md" className="text-center">
                    <span className="text-4xl mb-3 block">{category.icon}</span>
                    <span className="text-sm font-medium text-text-primary">
                      {category.name}
                    </span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items Section */}
      <section className="py-20 px-4 bg-background-secondary/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-2">
                Recently Listed
              </h2>
              <p className="text-text-secondary">
                Fresh items available for rent in your area
              </p>
            </div>
            <Link href="/browse">
              <Button variant="ghost" icon={<ChevronRight className="w-5 h-5" />} iconPosition="right">
                View All
              </Button>
            </Link>
          </motion.div>

          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ItemCard item={item} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-text-muted" />
              </div>
              <p className="text-text-secondary mb-4">No items listed yet</p>
              <Link href="/list-item">
                <Button>Be the first to list</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Renting is simple, safe, and sustainable
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <Card padding="lg" className="text-center h-full">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm">{step.description}</p>
                </Card>
                {/* Arrow connector */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-text-muted" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background-secondary/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
              Why Choose Rentzy?
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Built for trust, convenience, and community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card padding="lg" className="flex items-start gap-5 h-full">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0`}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card
              variant="glow"
              padding="lg"
              className="text-center bg-gradient-to-br from-surface to-background-tertiary"
            >
              <Sparkles className="w-12 h-12 text-accent-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-display font-bold text-text-primary mb-4">
                Ready to Start?
              </h2>
              <p className="text-text-secondary max-w-xl mx-auto mb-8">
                Join thousands of people in your community who are already saving money
                and reducing waste through sharing.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <>
                    <Link href="/browse">
                      <Button size="lg">Browse Items</Button>
                    </Link>
                    <Link href="/list-item">
                      <Button size="lg" variant="secondary">
                        List Your First Item
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signup">
                      <Button size="lg">Create Free Account</Button>
                    </Link>
                    <Link href="/browse">
                      <Button size="lg" variant="secondary">
                        Browse as Guest
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-tertiary flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="font-display text-xl font-bold gradient-text">
                  Rentzy
                </span>
              </div>
              <p className="text-text-secondary text-sm">
                The community-powered rental marketplace. Borrow, rent, and share with
                people near you.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/browse" className="text-text-secondary hover:text-accent-primary">
                    Browse Items
                  </Link>
                </li>
                <li>
                  <Link href="/list-item" className="text-text-secondary hover:text-accent-primary">
                    List an Item
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-text-secondary hover:text-accent-primary">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-text-secondary hover:text-accent-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-text-secondary hover:text-accent-primary">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="text-text-secondary hover:text-accent-primary">
                    Safety Tips
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-text-primary mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-text-secondary hover:text-accent-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-text-secondary hover:text-accent-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-text-secondary hover:text-accent-primary">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-text-muted text-sm">
              © 2026 Rentzy. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </MainLayout>
  );
}
