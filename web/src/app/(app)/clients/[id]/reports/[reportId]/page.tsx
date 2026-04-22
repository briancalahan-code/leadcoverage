import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MetricTile } from "@/components/reports/metric-tile";

interface Dimension {
  title: string;
  metrics: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "flat";
  }[];
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>;
}) {
  const { id, reportId } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("generated_reports")
    .select("*")
    .eq("id", reportId)
    .eq("client_id", id)
    .single();

  if (!report) notFound();

  const dimensions = (report.dimensions ?? {}) as Record<string, Dimension>;
  const dimensionEntries = Object.entries(dimensions);

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href={`/clients/${id}/reports`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block"
      >
        &larr; Back to Reports
      </Link>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {report.title ?? "Stage 7 Review"}
        </h2>
        <div className="flex items-center gap-3 mt-1">
          {report.period && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {report.period}
            </span>
          )}
          <span className="text-xs text-gray-500">
            Generated {new Date(report.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Narrative */}
      {report.narrative && (
        <div className="bg-white rounded-lg border p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Executive Summary
          </h3>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {report.narrative}
          </div>
        </div>
      )}

      {/* Dimensions */}
      {dimensionEntries.length > 0 ? (
        <div className="space-y-4">
          {dimensionEntries.map(([key, dim]) => (
            <div key={key} className="bg-white rounded-lg border p-5">
              <h3 className="font-semibold text-gray-900 mb-3">{dim.title}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dim.metrics.map((metric) => (
                  <MetricTile
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    trend={metric.trend}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed p-6 text-center">
          No dimension data available for this report.
        </div>
      )}

      {/* Raw content fallback */}
      {report.content &&
        Object.keys(report.content as Record<string, unknown>).length > 0 &&
        dimensionEntries.length === 0 && (
          <div className="mt-6 bg-white rounded-lg border p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Report Data
            </h3>
            <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
              {JSON.stringify(report.content, null, 2)}
            </pre>
          </div>
        )}
    </div>
  );
}
