"use client";

import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  totalReviews?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const sizes = {
  sm: 14,
  md: 18,
  lg: 24,
};

export function Rating({
  value,
  max = 5,
  size = "md",
  showValue = false,
  totalReviews,
  interactive = false,
  onChange,
}: RatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(value);
          const partial = !filled && i < value;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleClick(i)}
              className={`
                relative transition-transform
                ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}
              `}
            >
              {/* Background star */}
              <Star
                size={sizes[size]}
                className="text-text-muted/30"
                fill="currentColor"
              />
              
              {/* Filled star overlay */}
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(value - i) * 100}%` : "100%" }}
                >
                  <Star
                    size={sizes[size]}
                    className="text-warning"
                    fill="currentColor"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-text-secondary text-sm font-medium ml-1">
          {value.toFixed(1)}
        </span>
      )}

      {totalReviews !== undefined && (
        <span className="text-text-muted text-sm">
          ({totalReviews} {totalReviews === 1 ? "review" : "reviews"})
        </span>
      )}
    </div>
  );
}
