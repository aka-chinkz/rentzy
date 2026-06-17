"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Package, SlidersHorizontal, X, Tag } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
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

type SearchSuggestion =
  | { type: "item"; id: string; title: string; image?: string; price: number }
  | { type: "category"; value: string; label: string };

export default function BrowsePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const { location, locationName, requestLocation, calculateDistance } = useLocation();

  const [items, setItems] = useState<(Item & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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

  useEffect(() => {
    const query = filters.query.trim();

    if (!query) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const categoryMatches: SearchSuggestion[] = categories
          .filter(
            (cat) =>
              cat.value &&
              (cat.label.toLowerCase().includes(query.toLowerCase()) ||
                cat.value.toLowerCase().includes(query.toLowerCase()))
          )
          .slice(0, 2)
          .map((cat) => ({ type: "category", value: cat.value, label: cat.label }));

        const { data } = await itemsAPI.getItems({ q: query, limit: 5 });
        const itemMatches: SearchSuggestion[] = (data?.items || []).map(
          (item: Item) => ({
            type: "item",
            id: item.id,
            title: item.title,
            image: item.images?.[0],
            price: item.rent_price_per_day,
          })
        );

        setSuggestions([...categoryMatches, ...itemMatches]);
      } catch {
        setSuggestions([]);
      }
      setSuggestionsLoading(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [filters.query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);

    if (suggestion.type === "item") {
      router.push(`/items/${suggestion.id}`);
      return;
    }

    setFilters({ ...filters, category: suggestion.value, query: "" });
  };

  const query = filters.query.trim();
  const canShowSuggestions = showSuggestions && query.length > 0;

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Search bar (below app navbar) */}
        <div className="sticky top-14 z-40 glass-strong border-b border-border lg:top-14">
          <div className="flex items-center gap-4 px-4 py-3">
            <div ref={searchRef} className="relative max-w-2xl flex-1">
              <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 transition-all focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/15">
                <Search className="h-5 w-5 shrink-0 text-text-muted" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => {
                    setFilters({ ...filters, query: e.target.value });
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setShowSuggestions(false);
                  }}
                  placeholder="Search for items..."
                  className="w-full min-w-0 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={canShowSuggestions}
                  aria-controls="search-suggestions"
                />
                {filters.query && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilters({ ...filters, query: "" });
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {canShowSuggestions && (
                  <motion.div
                    id="search-suggestions"
                    role="listbox"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-lg"
                  >
                    {suggestionsLoading ? (
                      <div className="py-1">
                        {[0, 1, 2].map((index) => (
                          <div
                            key={index}
                            className="search-suggestion-skeleton animate-pulse"
                            aria-hidden
                          >
                            <div className="skeleton-avatar" />
                            <div className="skeleton-lines">
                              <div className="skeleton-line-primary" />
                              <div className="skeleton-line-secondary" />
                            </div>
                            <div className="skeleton-dot" />
                          </div>
                        ))}
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-text-muted">
                        No suggestions for &ldquo;{query}&rdquo;
                      </div>
                    ) : (
                      <ul className="max-h-80 overflow-y-auto py-1">
                        {suggestions.map((suggestion) =>
                          suggestion.type === "category" ? (
                            <li key={`category-${suggestion.value}`}>
                              <button
                                type="button"
                                role="option"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                              >
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                                  <Tag className="h-4 w-4 text-accent-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-text-primary">{suggestion.label}</p>
                                  <p className="text-xs text-text-muted">Category</p>
                                </div>
                              </button>
                            </li>
                          ) : (
                            <li key={`item-${suggestion.id}`}>
                              <button
                                type="button"
                                role="option"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSuggestionSelect(suggestion)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
                              >
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
                                  {suggestion.image ? (
                                    <img
                                      src={suggestion.image}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Package className="h-4 w-4 text-text-muted" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-text-primary">
                                    {suggestion.title}
                                  </p>
                                  <p className="text-xs text-text-muted">Listing</p>
                                </div>
                                <span className="shrink-0 text-sm font-semibold text-accent-primary">
                                  ₹{suggestion.price}/day
                                </span>
                              </button>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-surface-elevated"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

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
                  placeholder="₹0"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice || ""}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="input-field"
                  placeholder="₹500"
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
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">Location</label>
                <select
                  value={filters.sortBy === "distance" ? "nearest" : "all"}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "nearest") {
                      setFilters({ ...filters, sortBy: "distance" });
                    } else {
                      // Reset to default sorting when showing all products
                      setFilters({ ...filters, sortBy: "newest" });
                    }
                  }}
                  className="input-field"
                >
                  <option value="all">All products</option>
                  <option value="nearest">Nearest to me</option>
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
                      ₹{item.rent_price_per_day}<span className="text-sm text-text-secondary font-normal">/day</span>
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        </main>
      </div>
    </MainLayout>
  );
}
