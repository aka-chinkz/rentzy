"use client";

import { forwardRef, HTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: "default" | "interactive" | "glow";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "md" | "lg" | "xl" | "2xl";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const roundings = {
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "default",
      padding = "md",
      rounded = "2xl",
      className = "",
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      glass ${paddings[padding]} ${roundings[rounded]}
      ${variant === "interactive" ? "glass-hover cursor-pointer" : ""}
      ${variant === "glow" ? "shadow-glow" : ""}
      ${className}
    `;

    if (variant === "interactive") {
      return (
        <motion.div
          ref={ref}
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={baseClasses}
          {...props}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={baseClasses}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
