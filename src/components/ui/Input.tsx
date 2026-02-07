"use client";

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "glass";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = "left",
      variant = "default",
      className = "",
      type,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const inputClasses = `
      w-full py-3 rounded-xl transition-all duration-300 text-text-primary placeholder:text-text-muted
      focus:outline-none focus:ring-2 focus:ring-accent-glow
      ${variant === "glass" ? "glass" : "bg-background-secondary border border-border focus:border-border-active"}
      ${icon && iconPosition === "left" ? "pl-11 pr-4" : ""}
      ${icon && iconPosition === "right" ? "pl-4 pr-11" : ""}
      ${!icon ? "px-4" : ""}
      ${isPassword ? "pr-11" : ""}
      ${error ? "border-error/50 focus:ring-error-glow" : ""}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={inputClasses}
            {...props}
          />
          {icon && iconPosition === "right" && !isPassword && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
