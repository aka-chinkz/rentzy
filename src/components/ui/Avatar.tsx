"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-xl",
};

const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
  xl: 40,
};

export function Avatar({
  src,
  alt = "User avatar",
  size = "md",
  className = "",
  showGlow = false,
}: AvatarProps) {
  const baseClasses = `
    relative rounded-full overflow-hidden flex items-center justify-center
    border-2 border-border bg-background-secondary
    ${showGlow ? "ring-2 ring-accent-glow" : ""}
    ${sizes[size]}
    ${className}
  `;

  if (src) {
    return (
      <div className={baseClasses}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={`(max-width: 768px) ${iconSizes[size] * 4}px, ${iconSizes[size] * 4}px`}
        />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <User size={iconSizes[size]} className="text-text-muted" />
    </div>
  );
}
