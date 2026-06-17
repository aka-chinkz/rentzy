"use client";

import Link from "next/link";
import {
  ChevronRight,
  LayoutGrid,
  Smartphone,
  Dumbbell,
  Wrench,
  Camera,
  PartyPopper,
  Music2,
  type LucideIcon,
} from "lucide-react";

const categories: {
  id: string;
  name: string;
  icon: LucideIcon;
  accent: string;
  iconColor: string;
  ring: string;
}[] = [
  {
    id: "electronics",
    name: "Electronics",
    icon: Smartphone,
    accent: "from-blue-500/25 via-blue-500/5 to-transparent",
    iconColor: "text-blue-400",
    ring: "group-hover:shadow-[0_0_24px_rgba(59,130,246,0.2)]",
  },
  {
    id: "sports",
    name: "Sports",
    icon: Dumbbell,
    accent: "from-emerald-500/25 via-emerald-500/5 to-transparent",
    iconColor: "text-emerald-400",
    ring: "group-hover:shadow-[0_0_24px_rgba(52,211,153,0.2)]",
  },
  {
    id: "tools",
    name: "Tools",
    icon: Wrench,
    accent: "from-amber-500/25 via-amber-500/5 to-transparent",
    iconColor: "text-amber-400",
    ring: "group-hover:shadow-[0_0_24px_rgba(251,191,36,0.2)]",
  },
  {
    id: "cameras",
    name: "Cameras",
    icon: Camera,
    accent: "from-violet-500/25 via-violet-500/5 to-transparent",
    iconColor: "text-violet-400",
    ring: "group-hover:shadow-[0_0_24px_rgba(167,139,250,0.2)]",
  },
  {
    id: "party",
    name: "Party",
    icon: PartyPopper,
    accent: "from-pink-500/25 via-pink-500/5 to-transparent",
    iconColor: "text-pink-400",
    ring: "group-hover:shadow-[0_0_24px_rgba(244,114,182,0.2)]",
  },
  {
    id: "music",
    name: "Music",
    icon: Music2,
    accent: "from-cyan-500/25 via-cyan-500/5 to-transparent",
    iconColor: "text-cyan-400",
    ring: "group-hover:shadow-[0_0_24px_rgba(34,211,238,0.2)]",
  },
];

export function CategoryBento() {
  return (
    <section className="relative -mx-4 overflow-visible py-24 px-4 lg:-mx-8 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(59,130,246,0.06),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-elevated/80 px-3 py-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            <LayoutGrid className="h-3.5 w-3.5 text-accent-primary" />
            Explore
          </span>
          <h2 className="mb-2 font-display text-3xl font-bold md:text-4xl">Browse Categories</h2>
          <p className="text-text-secondary">Find exactly what you need in your neighborhood</p>
        </div>

        <div className="grid grid-cols-2 gap-4 overflow-visible md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                className="category-item-hover group relative block overflow-hidden rounded-2xl border border-border/50 bg-surface-elevated/70 p-5 text-center backdrop-blur-md"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${category.accent} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/[0.03] blur-2xl transition-opacity duration-300 group-hover:opacity-100"
                />

                <div className="relative flex flex-col items-center">
                  <div
                    className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-background/60 shadow-inner transition-shadow duration-300 ${category.ring}`}
                  >
                    <Icon className={`h-6 w-6 ${category.iconColor}`} strokeWidth={1.75} />
                  </div>
                  <span className="font-medium text-text-primary">{category.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link href="/browse" className="btn-slide-reveal">
            View All
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
