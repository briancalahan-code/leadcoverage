import type { GoalsBackwardsMath } from "@/types/database";
import { ProgressBar } from "@/components/shared/progress-bar";

interface GoalsSnapshotProps {
  goalsData: GoalsBackwardsMath | null;
}

function formatCurrency(value: number | null): string {
  if (value == null) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function MetricCard({
  label,
  value,
  subLabel,
  progress,
}: {
  label: string;
  value: string;
  subLabel?: string;
  progress?: number;
}) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-900 font-mono">{value}</p>
      {subLabel && <p className="text-xs text-gray-500 mt-1">{subLabel}</p>}
      {progress != null && (
        <div className="mt-3">
          <ProgressBar value={progress} />
        </div>
      )}
    </div>
  );
}

export function GoalsSnapshot({ goalsData }: GoalsSnapshotProps) {
  if (!goalsData) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
        <p className="text-sm text-gray-500">Goals not configured yet.</p>
        <p className="text-xs text-gray-400 mt-1">
          Your LeadCoverage team will set up backwards math goals for your
          account.
        </p>
      </div>
    );
  }

  const pipelineProgress =
    goalsData.required_pipeline && goalsData.current_pipeline
      ? Math.round(
          (goalsData.current_pipeline / goalsData.required_pipeline) * 100,
        )
      : undefined;

  const mqlProgress =
    goalsData.required_mqls && goalsData.current_mqls
      ? Math.round((goalsData.current_mqls / goalsData.required_mqls) * 100)
      : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Goals &amp; Backwards Math
        </h3>
        {goalsData.period && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {goalsData.period}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Revenue Target"
          value={formatCurrency(goalsData.revenue_target)}
        />
        <MetricCard
          label="Pipeline Needed"
          value={formatCurrency(goalsData.required_pipeline)}
          subLabel={
            goalsData.current_pipeline != null
              ? `Current: ${formatCurrency(goalsData.current_pipeline)}`
              : undefined
          }
          progress={pipelineProgress}
        />
        <MetricCard
          label="Deals Needed"
          value={
            goalsData.required_sqls != null
              ? String(goalsData.required_sqls)
              : "--"
          }
          subLabel={
            goalsData.win_rate != null
              ? `Win rate: ${Math.round(goalsData.win_rate * 100)}%`
              : undefined
          }
        />
        <MetricCard
          label="MQLs Needed"
          value={
            goalsData.required_mqls != null
              ? String(goalsData.required_mqls)
              : "--"
          }
          subLabel={
            goalsData.current_mqls != null
              ? `Current: ${goalsData.current_mqls}`
              : undefined
          }
          progress={mqlProgress}
        />
      </div>
    </div>
  );
}
