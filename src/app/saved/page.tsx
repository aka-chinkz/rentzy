"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ItemGrid } from "@/components/items/ItemGrid";
import { Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Item, Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function SavedItemsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const [items, setItems] = useState<(Item & { owner?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    async function fetchSavedItems() {
      const { data, error } = await supabase
        .from("saved_items")
        .select("item:items(*, owner:profiles(*))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const items = data
          .map((s: any) => s.item)
          .filter(Boolean);
        setItems(items);
      }
      setLoading(false);
    }

    fetchSavedItems();
  }, [user]);

  if (!user) return null;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-text-primary mb-2">
            Saved Items
          </h1>
          <p className="text-text-secondary">
            Items you've saved for later
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-2xl p-4 animate-pulse">
                <div className="aspect-[4/3] bg-surface rounded-lg mb-4" />
                <div className="h-4 bg-surface rounded w-3/4 mb-2" />
                <div className="h-4 bg-surface rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <ItemGrid items={items} />
        ) : (
          <Card className="text-center py-16">
            <Heart className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No saved items
            </h3>
            <p className="text-text-secondary">
              Browse items and tap the heart to save them here
            </p>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
