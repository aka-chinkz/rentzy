"use client";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Pre-built skeleton components for common patterns
export function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-4 space-y-4">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <div className="space-y-2">
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton width={80} />
        <Skeleton width={60} />
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="space-y-2">
        <Skeleton width={120} />
        <Skeleton width={80} />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}
