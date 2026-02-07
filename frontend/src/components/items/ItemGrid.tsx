"use client";

import { Item, Profile } from "@/types";
import { ItemCard } from "./ItemCard";

interface ItemGridProps {
  items: (Item & { owner?: Profile })[];
  showOwner?: boolean;
  columns?: 2 | 3 | 4;
  isSavedList?: boolean;
  onSaveToggle?: () => void;
}

export function ItemGrid({
  items,
  showOwner = true,
  columns = 4,
  isSavedList = false,
  onSaveToggle,
}: ItemGridProps) {
  const gridClass =
    columns === 2
      ? "grid grid-cols-1 sm:grid-cols-2 gap-6"
      : columns === 3
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";

  return (
    <div className={gridClass}>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          showOwner={showOwner}
          isSaved={isSavedList}
          onSaveToggle={onSaveToggle}
        />
      ))}
    </div>
  );
}
