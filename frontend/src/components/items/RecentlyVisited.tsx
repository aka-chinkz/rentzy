"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { ItemCard } from "@/components/items/ItemCard";
import { itemsAPI } from "@/lib/api";
import {
  getRecentlyVisitedIds,
  RECENTLY_VISITED_EVENT,
  removeRecentlyVisited,
} from "@/lib/recentlyVisited";
import { Item, Profile } from "@/types";

const DISPLAY_LIMIT = 8;

export function RecentlyVisited() {
  const [items, setItems] = useState<(Item & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasHistory, setHasHistory] = useState(false);

  const loadItems = useCallback(async () => {
    const ids = getRecentlyVisitedIds(DISPLAY_LIMIT);
    setHasHistory(ids.length > 0);

    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const results = await Promise.allSettled(
      ids.map((id) => itemsAPI.getItem(id))
    );

    const fetched: (Item & { owner?: Profile })[] = [];

    results.forEach((result, index) => {
      const id = ids[index];

      if (result.status === "fulfilled" && result.value.data?.item) {
        fetched.push(result.value.data.item);
      } else {
        removeRecentlyVisited(id);
      }
    });

    setItems(fetched);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadItems();

    const handleUpdate = () => loadItems();
    window.addEventListener(RECENTLY_VISITED_EVENT, handleUpdate);
    window.addEventListener("focus", handleUpdate);

    return () => {
      window.removeEventListener(RECENTLY_VISITED_EVENT, handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [loadItems]);

  return (
    <section className="py-24">
      <div className="mb-12 flex items-end justify-between gap-4">
        <div>
          <h2 className="mb-2 font-display text-3xl font-bold md:text-4xl">Recently Visited</h2>
          <p className="text-text-secondary">Pick up where you left off</p>
        </div>
        {items.length > 0 && (
          <Link
            href="/browse"
            className="flex shrink-0 items-center gap-1 text-accent-primary transition-colors hover:text-accent-secondary"
          >
            Browse More <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-72 animate-pulse bg-surface-elevated" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
          <History className="mb-4 h-12 w-12 text-text-muted" />
          <p className="mb-2 text-lg font-medium">
            {hasHistory ? "Your recently visited items are no longer available" : "No recently visited items yet"}
          </p>
          <p className="mb-6 max-w-md text-text-secondary">
            {hasHistory
              ? "Those listings may have been removed. Browse to discover something new."
              : "Open an item to see it here for quick access later."}
          </p>
          <Link href="/browse" className="btn-primary">
            Browse Items
          </Link>
        </div>
      )}
    </section>
  );
}
