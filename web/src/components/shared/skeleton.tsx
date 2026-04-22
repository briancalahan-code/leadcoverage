import { type HTMLAttributes } from "react";

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Base shimmer block */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse bg-gray-200 rounded", className)}
      {...props}
    />
  );
}

/** Card-shaped skeleton with inner placeholder lines */
export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("bg-white rounded-lg border p-6", className)} {...props}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-5/6 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/** Table skeleton with shimmer rows */
export function SkeletonTable({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("bg-white rounded-lg border overflow-hidden", className)}
      {...props}
    >
      {/* Header row */}
      <div className="flex gap-4 p-4 border-b bg-gray-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: 5 }).map((_, row) => (
        <div key={row} className="flex gap-4 p-4 border-b last:border-b-0">
          {Array.from({ length: 4 }).map((_, col) => (
            <Skeleton key={col} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Multiple text lines of varying width */
export function SkeletonText({ className, ...props }: SkeletonProps) {
  const widths = ["w-full", "w-5/6", "w-4/6", "w-3/4"];
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {widths.map((w, i) => (
        <Skeleton key={i} className={`h-3 ${w}`} />
      ))}
    </div>
  );
}
