interface MetricTileProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "flat";
  color?: string;
}

const trendColors = {
  up: "bg-emerald-400",
  down: "bg-red-400",
  flat: "bg-gray-300",
};

const trendIcons = {
  up: "↑",
  down: "↓",
  flat: "→",
};

const trendTextColors = {
  up: "text-emerald-600",
  down: "text-red-600",
  flat: "text-gray-500",
};

export function MetricTile({
  label,
  value,
  trend = "flat",
  color,
}: MetricTileProps) {
  const barColor = color ?? trendColors[trend];

  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col justify-between min-w-0">
      <p className="text-xs text-gray-500 font-medium truncate mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-mono font-semibold text-gray-900 leading-none">
          {value}
        </span>
        <span
          className={`text-sm font-medium ${trendTextColors[trend]} mb-0.5`}
        >
          {trendIcons[trend]}
        </span>
      </div>
      {/* Sparkline placeholder bar */}
      <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full w-3/5 rounded-full ${barColor}`} />
      </div>
    </div>
  );
}
