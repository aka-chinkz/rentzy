"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Package, SlidersHorizontal, X } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { itemsAPI } from "@/lib/api";
import { Item, Profile, SearchFilters } from "@/types";

const categories = [
  { value: "", label: "All Categories" },
  { value: "electronics", label: "Electronics" },
  { value: "sports", label: "Sports & Outdoors" },
  { value: "tools", label: "Tools & Equipment" },
  { value: "cameras", label: "Cameras & Photo" },
  { value: "party", label: "Party & Events" },
  { value: "music", label: "Music & Audio" },
  { value: "books", label: "Books & Media" },
  { value: "fashion", label: "Fashion" },
  { value: "other", label: "Other" },
];

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const { location, locationName, requestLocation, calculateDistance } = useLocation();

  const [items, setItems] = useState<(Item & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    distance: searchParams.get("distance") ? Number(searchParams.get("distance")) : undefined,
    sortBy: (searchParams.get("sortBy") as SearchFilters["sortBy"]) || "newest",
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await itemsAPI.getItems({
        q: filters.query || undefined,
        category: filters.category || undefined,
        minPrice: filters.minPrice?.toString(),
        maxPrice: filters.maxPrice?.toString(),
        sortBy: filters.sortBy,
        limit: 50,
      });

      if (data?.items) {
        let filteredItems = data.items as (Item & { owner?: Profile })[];

        if (filters.distance && location) {
          filteredItems = filteredItems.filter((item) => {
            const distance = calculateDistance(item.pickup_location_lat, item.pickup_location_lng);
            return distance !== null && distance <= filters.distance!;
          });
        }

        if (filters.sortBy === "distance" && location) {
          filteredItems.sort((a, b) => {
            const distA = calculateDistance(a.pickup_location_lat, a.pickup_location_lng) || Infinity;
            const distB = calculateDistance(b.pickup_location_lat, b.pickup_location_lng) || Infinity;
            return distA - distB;
          });
        }

        setItems(filteredItems);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    }
    setLoading(false);
  }, [filters, location, calculateDistance]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Package className="w-7 h-7 text-accent-primary" />
              <span className="font-display font-bold text-xl hidden sm:block">Rentzy</span>
            </Link>

            <div className="flex-1 max-w-2xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                placeholder="Search for items..."
                className="input-field pl-10 pr-4"
              />
            </div>

            <button onClick={() => setShowFilters(!showFilters)} className="btn-ghost flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice || ""}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="input-field"
                  placeholder="$0"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice || ""}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="input-field"
                  placeholder="$500"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SearchFilters["sortBy"] })}
                  className="input-field"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </div>

            {!location && (
              <button onClick={requestLocation} className="mt-4 text-accent-primary text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Enable location for distance filter
              </button>
            )}
          </motion.div>
        )}

        {/* Location Bar */}
        {location && locationName && (
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            <MapPin className="w-4 h-4" />
            <span>Showing results near {locationName}</span>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-[4/3] bg-surface-elevated" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-surface-elevated rounded w-3/4" />
                  <div className="h-4 bg-surface-elevated rounded w-1/2" />
                  <div className="h-6 bg-surface-elevated rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No items found</h3>
            <p className="text-text-secondary">Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/items/${item.id}`} className="card-hover block">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-elevated flex items-center justify-center">
                        <Package className="w-12 h-12 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    {location && (
                      <p className="text-sm text-text-secondary flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" />
                        {calculateDistance(item.pickup_location_lat, item.pickup_location_lng)?.toFixed(1) || "?"} km away
                      </p>
                    )}
                    <p className="text-accent-primary font-bold text-xl">
                      ${item.rent_price_per_day}<span className="text-sm text-text-secondary font-normal">/day</span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
