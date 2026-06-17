"use client";

import React, { useEffect } from "react";
import { Loader2, Star } from "lucide-react";

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent-primary text-white hover:bg-accent-primary/90",
    secondary: "bg-surface-elevated text-text-primary border border-border hover:bg-surface-hover",
    outline: "border border-border text-text-primary hover:bg-surface-elevated",
    ghost: "text-text-muted hover:text-text-primary hover:bg-surface-elevated/50",
    danger: "bg-error text-white hover:bg-error/90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

// Rating Component (display-only or interactive for reviews)
interface RatingProps {
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  totalReviews?: number;
  /** When true, stars are clickable and call onChange with 1–5 */
  interactive?: boolean;
  onChange?: (value: number) => void;
}

export function Rating({
  value,
  size = "md",
  showValue,
  totalReviews,
  interactive,
  onChange,
}: RatingProps) {
  const stars = 5;
  const iconSize =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";
  const [hover, setHover] = React.useState<number | null>(null);
  const displayValue = hover != null ? hover + 1 : value;

  const content = (
    <div className="flex items-center gap-1">
      {Array.from({ length: stars }, (_, i) => {
        const filled = i < Math.floor(displayValue);
        const starEl = (
          <Star
            key={i}
            className={`${iconSize} transition-colors ${
              filled ? "fill-warning text-warning" : "text-border"
            } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
          />
        );
        if (interactive && onChange) {
          return (
            <button
              key={i}
              type="button"
              className="p-0.5 focus:outline-none focus:ring-0"
              onClick={() => onChange(i + 1)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              aria-label={`Rate ${i + 1} stars`}
            >
              {starEl}
            </button>
          );
        }
        return starEl;
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-text-primary">
          {value.toFixed(1)}
        </span>
      )}
      {totalReviews != null && (
        <span className="ml-1 text-sm text-text-muted">({totalReviews})</span>
      )}
    </div>
  );

  return content;
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, size = "md", children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-xl border border-border bg-surface-elevated p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id="modal-title" className="mb-4 text-xl font-semibold text-text-primary">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          className={`w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-text-primary placeholder-text-muted transition-all duration-200 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/15 ${
            icon ? "pl-10" : ""
          } ${error ? "border-error" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Textarea Component
interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-text-primary placeholder-text-muted transition-all duration-200 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/15 ${
          error ? "border-error" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-medium text-dark-muted">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-lg border border-border bg-surface-elevated px-4 py-2.5 text-text-primary transition-all duration-200 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/15 ${
          error ? "border-error" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  variant?: "default" | "glow" | "interactive";
  padding?: "default" | "sm";
}

export function Card({
  children,
  className = "",
  hover = false,
  glass = false,
  variant = "default",
  padding = "default",
}: CardProps) {
  const paddingClass = padding === "sm" ? "p-4" : "p-6";
  const variantClass =
    variant === "glow"
      ? "shadow-glow-subtle"
      : variant === "interactive"
        ? "transition-all duration-200 hover:border-border-subtle cursor-default"
        : "";
  return (
    <div
      className={`rounded-xl border border-border ${paddingClass} ${
        glass ? "bg-surface/80 backdrop-blur-xl" : "bg-surface"
      } ${hover ? "transition-all duration-200 hover:border-border-subtle" : ""} ${variantClass} ${className}`}
    >
      {children}
    </div>
  );
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "neutral" | "primary";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-0.5";
  const variants: Record<string, string> = {
    default: "bg-surface-elevated text-text-muted",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-accent-primary/10 text-accent-primary",
    neutral: "bg-surface-elevated text-text-secondary",
    primary: "bg-accent-primary/10 text-accent-primary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
    </span>
  );
}

// Avatar Component
interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
}: AvatarProps) {
  const sizes: Record<string, string> = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-accent-primary font-medium text-white ${sizes[size] ?? sizes.md} ${className}`}
      >
        {alt?.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${sizes[size] ?? sizes.md} ${className}`}
    />
  );
}

// Skeleton Component
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-dark-tertiary ${className}`}
    />
  );
}

// Spinner Component
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2
      className={`animate-spin text-accent-primary ${sizes[size]} ${className}`}
    />
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 rounded-full bg-dark-tertiary p-4 text-dark-muted">
          {icon}
        </div>
      )}
      <h3 className="mb-2 text-lg font-medium text-white">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-dark-muted">{description}</p>
      )}
      {action}
    </div>
  );
}
