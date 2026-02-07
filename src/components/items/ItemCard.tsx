"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, Calendar, Star } from "lucide-react";
import { Item, Profile } from "@/types";
import { Badge, Avatar } from "@/components/ui";
import { useLocation } from "@/contexts/LocationContext";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface ItemCardProps {
  item: Item & { owner?: Profile };
  showOwner?: boolean;
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

const conditionLabels: Record<string, string> = {
  new: "New",
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
};

export function ItemCard({
  item,
  showOwner = true,
  isSaved: initialSaved = false,
  onSaveToggle,
}: ItemCardProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [imageError, setImageError] = useState(false);
  const { calculateDistance } = useLocation();
  const { user } = useAuth();
  const supabase = createClient();

  const distance = calculateDistance(item.pickup_location_lat, item.pickup_location_lng);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save items");
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from("saved_items")
          .delete()
          .eq("user_id", user.id)
          .eq("item_id", item.id);
        setIsSaved(false);
        toast.success("Removed from saved items");
      } else {
        await supabase
          .from("saved_items")
          .insert({ user_id: user.id, item_id: item.id });
        setIsSaved(true);
        toast.success("Added to saved items");
      }
      onSaveToggle?.();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Link href={`/items/${item.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group glass rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {item.images?.[0] && !imageError ? (
            <Image
              src={item.images[0]}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
              <span className="text-text-muted text-sm">No image</span>
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          {/* Availability badge */}
          {item.is_available ? (
            <Badge variant="success" size="sm" className="absolute top-3 left-3">
              Available
            </Badge>
          ) : (
            <Badge variant="warning" size="sm" className="absolute top-3 left-3">
              Rented
            </Badge>
          )}

          {/* Save button */}
          <button
            onClick={handleSaveToggle}
            className={`
              absolute top-3 right-3 p-2 rounded-full transition-all duration-300
              ${
                isSaved
                  ? "bg-error/90 text-white"
                  : "bg-background/80 text-text-secondary hover:text-error backdrop-blur-sm"
              }
            `}
          >
            <Heart className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
          </button>

          {/* Price tag */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <span className="text-2xl font-display font-bold text-text-primary">
                ${item.rent_price_per_day}
              </span>
              <span className="text-text-secondary text-sm">/day</span>
            </div>
            {distance !== null && (
              <div className="flex items-center gap-1 text-text-secondary text-sm glass-sm rounded-full px-2 py-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title and condition */}
          <div>
            <h3 className="font-medium text-text-primary line-clamp-1 group-hover:text-accent-primary transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="neutral" size="sm">
                {conditionLabels[item.condition] || item.condition}
              </Badge>
              <span className="text-text-muted text-xs">
                ${item.security_deposit} deposit
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-text-muted text-sm">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{item.pickup_location_name}</span>
          </div>

          {/* Owner info */}
          {showOwner && item.owner && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Avatar src={item.owner.avatar_url} size="xs" />
                <span className="text-sm text-text-secondary">
                  {item.owner.full_name || "User"}
                </span>
              </div>
              {item.owner.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-warning fill-current" />
                  <span className="text-sm text-text-secondary">
                    {item.owner.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
