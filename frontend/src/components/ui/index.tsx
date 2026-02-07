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
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-accent-primary text-white hover:bg-accent-primary/90 shadow-lg shadow-accent-primary/25",
    secondary: "bg-dark-tertiary text-white hover:bg-dark-tertiary/80",
    outline: "border border-dark-border text-white hover:bg-dark-tertiary",
    ghost: "text-dark-muted hover:text-white hover:bg-dark-tertiary",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
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

// Rating Component
interface RatingProps {
  value: number;
  size?: "sm" | "md";
  showValue?: boolean;
  totalReviews?: number;
}

export function Rating({ value, size = "md", showValue, totalReviews }: RatingProps) {
  const stars = 5;
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: stars }, (_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < Math.floor(value) ? "fill-warning text-warning" : "text-border"
          }`}
        />
      ))}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-text-primary">{value.toFixed(1)}</span>
      )}
      {totalReviews != null && (
        <span className="ml-1 text-sm text-text-muted">({totalReviews})</span>
      )}
    </div>
  );
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-2xl border border-border bg-surface-elevated p-6 shadow-xl`}
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
        <label className="mb-2 block text-sm font-medium text-text-muted">
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
          className={`w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-text-primary placeholder-text-muted transition-all focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${
            icon ? "pl-10" : ""
          } ${error ? "border-red-500" : ""} ${className}`}
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
        <label className="mb-2 block text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-text-primary placeholder-text-muted transition-all focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${
          error ? "border-red-500" : ""
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
        className={`w-full rounded-xl border border-dark-border bg-dark-tertiary px-4 py-2.5 text-white transition-all focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${
          error ? "border-red-500" : ""
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
}

export function Card({
  children,
  className = "",
  hover = false,
  glass = false,
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-dark-border p-6 ${
        glass
          ? "bg-dark-secondary/50 backdrop-blur-xl"
          : "bg-dark-secondary"
      } ${
        hover
          ? "transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/50 hover:shadow-xl hover:shadow-accent-primary/5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  const variants = {
    default: "bg-dark-tertiary text-dark-muted",
    success: "bg-green-500/10 text-green-400",
    warning: "bg-yellow-500/10 text-yellow-400",
    error: "bg-red-500/10 text-red-400",
    info: "bg-blue-500/10 text-blue-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

// Avatar Component
interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  size = "md",
  className = "",
}: AvatarProps) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary font-medium text-white ${sizes[size]} ${className}`}
      >
        {alt?.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover ${sizes[size]} ${className}`}
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
