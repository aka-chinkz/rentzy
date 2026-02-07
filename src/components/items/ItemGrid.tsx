"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ItemCard } from "./ItemCard";
import { SkeletonCard } from "@/components/ui";
import { Item, Profile } from "@/types";

interface ItemGridProps {
  items: (Item & { owner?: Profile })[];
  loading?: boolean;
  emptyMessage?: ReactNode;
  columns?: 2 | 3 | 4;
}

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ItemGrid({
  items,
  loading = false,
  emptyMessage = "No items found",
  columns = 4,
  showOwner = true,
}: ItemGridProps & { showOwner?: boolean }) {
  if (loading) {
    return (
      <div className={`grid ${columnClasses[columns]} gap-6`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-surface flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <p className="text-text-secondary text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid ${columnClasses[columns]} gap-6`}
    >
      {items.map((itemData) => (
        <motion.div key={itemData.id} variants={item}>
          <ItemCard item={itemData} showOwner={showOwner} />
        </motion.div>
      ))}
    </motion.div>
  );
}
