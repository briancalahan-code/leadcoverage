import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HealthBanner } from "@/components/portal/health-banner";
import { ProgressBar } from "@/components/shared/progress-bar";
import type { AccountHealth } from "@/types/database";

function formatCurrency(value: number | null): string {
  if (value == null) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value == null) return "--";
  return `${Math.round(value * 100)}%`;
}

function DimensionSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">{title}</h4>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900 font-mono">
        {value}
      </span>
    </div>
  );
}

export default async function PortalHealthPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, account_health")
    .eq("slug", slug)
    .single();

  if (!client) notFound();

  const [{ data: goals }, { data: hubspotHealth }, { data: benchmarks }] =
    await Promise.all([
      supabase
        .from("goals_backwards_math")
        .select("*")
        .eq("client_id", client.id)
        .order("last_updated", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("hubspot_health")
        .select("*")
        .eq("client_id", client.id)
        .maybeSingle(),
      supabase
        .from("lc_edge_benchmarks")
        .select("*")
        .eq("client_id", client.id)
        .maybeSingle(),
    ]);

  const pipelineProgress =
    goals?.required_pipeline && goals?.current_pipeline
      ? Math.round((goals.current_pipeline / goals.required_pipeline) * 100)
      : null;

  return (
    <div>
      {/* Portal nav */}
      <nav className="flex gap-1 mb-8 border-b border-gray-200 -mt-2">
        <Link
          href={`/${slug}`}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Overview
        </Link>
        <Link
          href={`/${slug}/reports`}
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Reports
        </Link>
        <Link
          href={`/${slug}/health`}
          className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
        >
          Health
        </Link>
      </nav>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Account Health</h2>
      <p className="text-sm text-gray-500 mb-6">
        Detailed health breakdown for {client.name}
      </p>

      {/* Overall health banner */}
      <div className="mb-8">
        <HealthBanner
          health={client.account_health as AccountHealth | null}
          clientName={client.name}
        />
      </div>

      <div className="space-y-6">
        {/* Goals Backwards Math Visualization */}
        <DimensionSection title="Goals Backwards Math">
          {goals ? (
            <div>
              {goals.period && (
                <p className="text-xs text-gray-500 mb-4">
                  Period: {goals.period}
                </p>
              )}

              {/* Funnel visualization */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Revenue Target
                    </span>
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {formatCurrency(goals.revenue_target)}
                    </span>
                  </div>
                  <div className="h-8 bg-blue-100 rounded-lg flex items-center px-3">
                    <span className="text-xs font-medium text-blue-700">
                      Target
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7"
                    />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Pipeline Needed
                    </span>
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {formatCurrency(goals.required_pipeline)}
                    </span>
                  </div>
                  <div className="h-8 bg-indigo-100 rounded-lg flex items-center justify-between px-3">
                    <span className="text-xs font-medium text-indigo-700">
                      Required pipeline
                    </span>
                    {goals.current_pipeline != null && (
                      <span className="text-xs text-indigo-600">
                        Current: {formatCurrency(goals.current_pipeline)}
                      </span>
                    )}
                  </div>
                  {pipelineProgress != null && (
                    <div className="mt-1">
                      <ProgressBar value={pipelineProgress} />
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7"
                    />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Deals Needed</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {goals.required_sqls ?? "--"} SQLs
                    </span>
                  </div>
                  <div className="h-8 bg-violet-100 rounded-lg flex items-center justify-between px-3">
                    <span className="text-xs font-medium text-violet-700">
                      Win rate: {formatPercent(goals.win_rate)}
                    </span>
                    <span className="text-xs text-violet-600">
                      Avg deal: {formatCurrency(goals.avg_deal_size)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <svg
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7"
                    />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      Meetings Needed
                    </span>
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {goals.required_mqls ?? "--"} MQLs
                    </span>
                  </div>
                  <div className="h-8 bg-purple-100 rounded-lg flex items-center justify-between px-3">
                    <span className="text-xs font-medium text-purple-700">
                      Monthly target: {goals.monthly_mql_target ?? "--"}
                    </span>
                    {goals.current_mqls != null && (
                      <span className="text-xs text-purple-600">
                        Current: {goals.current_mqls}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & notes */}
              {(goals.on_track || goals.goal_notes) && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  {goals.on_track && (
                    <DataRow
                      label="Status"
                      value={
                        goals.on_track === "green"
                          ? "On Track"
                          : goals.on_track === "yellow"
                            ? "Needs Attention"
                            : "At Risk"
                      }
                    />
                  )}
                  {goals.goal_notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      {goals.goal_notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Goals not configured yet.</p>
          )}
        </DimensionSection>

        {/* HubSpot Health */}
        <DimensionSection title="HubSpot Health">
          {hubspotHealth ? (
            <div>
              <DataRow
                label="HubSpot Tier"
                value={hubspotHealth.hubspot_tier ?? "--"}
              />
              <DataRow
                label="Portal ID"
                value={hubspotHealth.portal_id ?? "--"}
              />
              <DataRow
                label="Last Data Hygiene"
                value={
                  hubspotHealth.last_data_hygiene
                    ? new Date(
                        hubspotHealth.last_data_hygiene,
                      ).toLocaleDateString()
                    : "--"
                }
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              HubSpot health data not available yet.
            </p>
          )}
        </DimensionSection>

        {/* LC Edge Benchmarks */}
        <DimensionSection title="LC Edge Benchmarks">
          {benchmarks ? (
            <div>
              <DataRow
                label="Email Benchmarks"
                value={
                  benchmarks.email_benchmarks ? "Configured" : "Not configured"
                }
              />
              <DataRow
                label="LinkedIn Benchmarks"
                value={
                  benchmarks.linkedin_benchmarks
                    ? "Configured"
                    : "Not configured"
                }
              />
              <DataRow
                label="Paid Media Benchmarks"
                value={
                  benchmarks.paid_media_benchmarks
                    ? "Configured"
                    : "Not configured"
                }
              />
              <DataRow
                label="Sales Benchmarks"
                value={
                  benchmarks.sales_benchmarks ? "Configured" : "Not configured"
                }
              />
              <DataRow
                label="Last Updated"
                value={
                  benchmarks.last_updated
                    ? new Date(benchmarks.last_updated).toLocaleDateString()
                    : "--"
                }
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Benchmark data not available yet.
            </p>
          )}
        </DimensionSection>
      </div>
    </div>
  );
}
