import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HealthBanner } from "@/components/portal/health-banner";
import { GoalsSnapshot } from "@/components/portal/goals-snapshot";
import type { AccountHealth } from "@/types/database";

export default async function PortalOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, account_health, website")
    .eq("slug", slug)
    .single();

  if (!client) notFound();

  const [{ data: goals }, { data: latestReport }] = await Promise.all([
    supabase
      .from("goals_backwards_math")
      .select("*")
      .eq("client_id", client.id)
      .order("last_updated", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("generated_reports")
      .select("id, title, period, narrative, created_at")
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div>
      {/* Portal nav */}
      <nav className="flex gap-1 mb-8 border-b border-gray-200 -mt-2">
        <Link
          href={`/${slug}`}
          className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
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
          className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Health
        </Link>
      </nav>

      <h2 className="text-xl font-bold text-gray-900 mb-6">{client.name}</h2>

      {/* Health banner */}
      <div className="mb-8">
        <HealthBanner
          health={client.account_health as AccountHealth | null}
          clientName={client.name}
        />
      </div>

      {/* Goals snapshot */}
      <div className="mb-8">
        <GoalsSnapshot goalsData={goals} />
      </div>

      {/* Latest report */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Latest Report
        </h3>
        {latestReport ? (
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">
                {latestReport.title ?? "Stage 7 Review"}
              </p>
              <span className="text-xs text-gray-500">
                {new Date(latestReport.created_at).toLocaleDateString()}
              </span>
            </div>
            {latestReport.period && (
              <p className="text-xs text-gray-500 mb-2">
                Period: {latestReport.period}
              </p>
            )}
            {latestReport.narrative && (
              <p className="text-sm text-gray-700 line-clamp-4">
                {latestReport.narrative}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
            <p className="text-sm text-gray-500">No reports generated yet.</p>
          </div>
        )}
      </div>

      {/* Key metrics tiles */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Key Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Meetings Booked
            </p>
            <p className="text-2xl font-semibold text-gray-900 font-mono">--</p>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Pipeline Value
            </p>
            <p className="text-2xl font-semibold text-gray-900 font-mono">--</p>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Content Published
            </p>
            <p className="text-2xl font-semibold text-gray-900 font-mono">--</p>
            <p className="text-xs text-gray-400 mt-1">Coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
