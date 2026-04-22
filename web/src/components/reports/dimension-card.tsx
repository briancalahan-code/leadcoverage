"use client";

import { useState } from "react";
import { MetricTile } from "./metric-tile";

interface Metric {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
}

interface DimensionCardProps {
  title: string;
  icon: string;
  metrics: Metric[];
  details?: string;
}

export function DimensionCard({
  title,
  icon,
  metrics,
  details,
}: DimensionCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Metrics grid */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              trend={metric.trend}
            />
          ))}
        </div>
      </div>

      {/* Expandable details */}
      {expanded && details && (
        <div className="px-5 pb-4 border-t">
          <p className="text-sm text-gray-600 pt-3">{details}</p>
        </div>
      )}
    </div>
  );
}
