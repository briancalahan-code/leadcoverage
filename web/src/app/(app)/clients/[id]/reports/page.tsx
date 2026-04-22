import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DimensionCard } from "@/components/reports/dimension-card";
import { GenerateReportButton } from "./generate-report-button";

const DIMENSIONS = [
  {
    title: "Pipeline Metrics",
    icon: "📊",
    details:
      "Pipeline health indicators tracking deal creation, total pipeline value, and average deal velocity through stages.",
    metrics: [
      { label: "Deals Created", value: 24, trend: "up" as const },
      { label: "Pipeline Value", value: "$1.2M", trend: "up" as const },
      { label: "Average Velocity", value: "32 days", trend: "down" as const },
    ],
  },
  {
    title: "Content Performance",
    icon: "📝",
    details:
      "Content output and engagement metrics across all formats including blogs, case studies, and social posts.",
    metrics: [
      { label: "Total Published", value: 18, trend: "up" as const },
      { label: "Top Performers", value: 5, trend: "flat" as const },
      { label: "Engagement Rate", value: "3.2%", trend: "up" as const },
    ],
  },
  {
    title: "Signal Health",
    icon: "📡",
    details:
      "Buying intent signals and data quality metrics powering the personalization engine.",
    metrics: [
      { label: "Intent Score", value: 72, trend: "up" as const },
      { label: "Active Signals", value: 145, trend: "up" as const },
      { label: "Signal Trend", value: "+12%", trend: "up" as const },
    ],
  },
  {
    title: "Outreach Effectiveness",
    icon: "📬",
    details:
      "Multi-channel outreach performance including email, LinkedIn, and phone touchpoints.",
    metrics: [
      { label: "Reply Rate", value: "8.4%", trend: "up" as const },
      { label: "Meetings Booked", value: 12, trend: "flat" as const },
      { label: "Follow-up Rate", value: "92%", trend: "up" as const },
    ],
  },
  {
    title: "Audience Growth",
    icon: "👥",
    details:
      "Contact database growth, list health, and data quality scoring across all audience segments.",
    metrics: [
      { label: "New Contacts", value: 340, trend: "up" as const },
      { label: "List Growth", value: "+5.1%", trend: "up" as const },
      { label: "Data Quality Score", value: "87%", trend: "flat" as const },
    ],
  },
];

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("generated_reports")
    .select("id, title, period, report_type, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500">
            Stage 7 reporting &mdash; 5-dimension performance dashboard
          </p>
        </div>
        <GenerateReportButton clientId={id} />
      </div>

      {/* Dimension cards */}
      <div className="space-y-4 mb-10">
        {DIMENSIONS.map((dim) => (
          <DimensionCard
            key={dim.title}
            title={dim.title}
            icon={dim.icon}
            metrics={dim.metrics}
            details={dim.details}
          />
        ))}
      </div>

      {/* Historical reports */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Historical Reports
        </h3>
        {!reports || reports.length === 0 ? (
          <div className="text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed p-6 text-center">
            No reports generated yet. Click &ldquo;Generate Report&rdquo; to
            create your first Stage 7 review.
          </div>
        ) : (
          <div className="bg-white rounded-lg border divide-y">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/clients/${id}/reports/${report.id}`}
                className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {report.title ?? "Stage 7 Review"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {report.period ?? "—"} &middot;{" "}
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
