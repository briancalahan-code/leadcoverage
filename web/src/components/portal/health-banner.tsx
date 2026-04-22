import type { AccountHealth } from "@/types/database";

interface HealthBannerProps {
  health: AccountHealth | null;
  clientName: string;
}

const config: Record<
  AccountHealth,
  { bg: string; border: string; emoji: string; label: string; message: string }
> = {
  green: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    emoji: "✅",
    label: "On Track",
    message: "is performing well across all key metrics.",
  },
  yellow: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    emoji: "⚠️",
    label: "Needs Attention",
    message: "has areas that need attention to stay on track.",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    emoji: "🚨",
    label: "At Risk",
    message: "requires immediate action on critical metrics.",
  },
};

export function HealthBanner({ health, clientName }: HealthBannerProps) {
  if (!health) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-6 py-4">
        <p className="text-sm text-gray-500">
          Account health has not been assessed yet.
        </p>
      </div>
    );
  }

  const { bg, border, emoji, label, message } = config[health];

  return (
    <div className={`w-full rounded-xl border ${border} ${bg} px-6 py-4`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-label={label}>
          {emoji}
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-gray-700">
            {clientName} {message}
          </p>
        </div>
      </div>
    </div>
  );
}
