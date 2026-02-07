"use client";

import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "success" | "warning" | "error" | "neutral";
  size?: "sm" | "md";
  icon?: ReactNode;
}

const variants = {
  primary: "bg-accent-primary/20 text-accent-primary border-accent-primary/30",
  success: "bg-success/20 text-success border-success/30",
  warning: "bg-warning/20 text-warning border-warning/30",
  error: "bg-error/20 text-error border-error/30",
  neutral: "bg-surface text-text-secondary border-border",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({
  children,
  variant = "primary",
  size = "md",
  icon,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium border
        ${variants[variant]} ${sizes[size]}
      `}
    >
      {icon}
      {children}
    </span>
  );
}
