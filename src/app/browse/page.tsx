"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  X,
  Grid3X3,
  Map as MapIcon,
  ChevronDown,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ItemGrid } from "@/components/items/ItemGrid";
import { Button, Input, Select, Card, Badge } from "@/components/ui";
import { useLocation } from "@/contexts/LocationContext";
import { Item, Profile, SearchFilters, ItemCondition } from "@/types";
import { createClient } from "@/lib/supabase/client";

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
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "distance", label: "Distance: Nearest" },
  { value: "rating", label: "Best Rated" },
];

const conditionOptions = [
  { value: "new", label: "New" },
  { value: "like_new", label: "Like New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const distanceOptions = [
  { value: "5", label: "5 km" },
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "", label: "Any distance" },
];

export default function BrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location, calculateDistance } = useLocation();
  const supabase = createClient();

  const [items, setItems] = useState<(Item & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Filters state
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    distance: searchParams.get("distance") ? Number(searchParams.get("distance")) : undefined,
    condition: [],
    sortBy: (searchParams.get("sortBy") as SearchFilters["sortBy"]) || "newest",
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("items")
      .select("*, owner:profiles(*)")
      .eq("is_available", true);

    // Apply text search
    if (filters.query) {
      query = query.or(
        `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
      );
    }

    // Apply price filters
    if (filters.minPrice) {
      query = query.gte("rent_price_per_day", filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte("rent_price_per_day", filters.maxPrice);
    }

    // Apply condition filter
    if (filters.condition && filters.condition.length > 0) {
      query = query.in("condition", filters.condition);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "price_low":
        query = query.order("rent_price_per_day", { ascending: true });
        break;
      case "price_high":
        query = query.order("rent_price_per_day", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      let filteredItems = data as (Item & { owner?: Profile })[];

      // Apply distance filter client-side
      if (filters.distance && location) {
        filteredItems = filteredItems.filter((item) => {
          const distance = calculateDistance(
            item.pickup_location_lat,
            item.pickup_location_lng
          );
          return distance !== null && distance <= filters.distance!;
        });
      }

      // Apply distance sorting client-side
      if (filters.sortBy === "distance" && location) {
        filteredItems.sort((a, b) => {
          const distA = calculateDistance(a.pickup_location_lat, a.pickup_location_lng) || Infinity;
          const distB = calculateDistance(b.pickup_location_lat, b.pickup_location_lng) || Infinity;
          return distA - distB;
        });
      }

      setItems(filteredItems);
    }

    setLoading(false);
  }, [filters, location, calculateDistance]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice.toString());
    if (filters.distance) params.set("distance", filters.distance.toString());
    if (filters.sortBy) params.set("sortBy", filters.sortBy);

    const newUrl = params.toString() ? `?${params.toString()}` : "/browse";
    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  const clearFilters = () => {
    setFilters({
      query: "",
      category: "",
      sortBy: "newest",
    });
  };

  const activeFiltersCount = [
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.distance,
    filters.condition?.length,
  ].filter(Boolean).length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
            Browse Items
          </h1>
          <p className="text-text-secondary">
            Discover items available for rent near you
          </p>
        </div>

        {/* Search and filters bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search for items..."
                value={filters.query}
                onChange={(e) =>
                  setFilters({ ...filters, query: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background-secondary border border-border text-text-primary placeholder:text-text-muted transition-all focus:outline-none focus:ring-2 focus:ring-accent-glow focus:border-border-active"
              />
            </div>
          </div>

          {/* Category select */}
          <div className="w-full lg:w-48">
            <Select
              options={categories}
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            />
          </div>

          {/* Sort select */}
          <div className="w-full lg:w-48">
            <Select
              options={sortOptions}
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: e.target.value as SearchFilters["sortBy"],
                })
              }
            />
          </div>

          {/* Filter toggle */}
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            icon={<SlidersHorizontal className="w-5 h-5" />}
          >
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="primary" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* View mode toggle */}
          <div className="flex items-center glass rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === "map"
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <MapIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-8"
            >
              <Card padding="md" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price range */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Price Range (per day)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-background-secondary border border-border text-text-primary text-sm"
                    />
                    <span className="text-text-muted">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice || ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-background-secondary border border-border text-text-primary text-sm"
                    />
                  </div>
                </div>

                {/* Distance */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Maximum Distance
                  </label>
                  <Select
                    options={distanceOptions}
                    value={filters.distance?.toString() || ""}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        distance: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Condition
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {conditionOptions.map((option) => {
                      const isSelected = filters.condition?.includes(
                        option.value as ItemCondition
                      );
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const current = filters.condition || [];
                            const updated = isSelected
                              ? current.filter((c) => c !== option.value)
                              : [...current, option.value as ItemCondition];
                            setFilters({ ...filters, condition: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            isSelected
                              ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                              : "bg-background-secondary text-text-secondary border border-border hover:border-border-hover"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Clear filters */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    icon={<X className="w-4 h-4" />}
                    fullWidth
                  >
                    Clear All Filters
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-text-secondary">
            {loading ? "Loading..." : `${items.length} items found`}
          </p>
        </div>

        {/* Items grid or map */}
        {viewMode === "grid" ? (
          <ItemGrid
            items={items}
            loading={loading}
            emptyMessage={
              <div className="text-center">
                <p className="mb-4">No items match your search criteria</p>
                <Button variant="secondary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            }
          />
        ) : (
          <div className="glass rounded-2xl p-4 h-[600px] flex items-center justify-center">
            <p className="text-text-secondary">
              Map view coming soon! Enable location services for best results.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
