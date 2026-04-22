"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Report {
  id: string;
  title: string | null;
  period: string | null;
  narrative: string | null;
  created_at: string;
}

export default function PortalReportsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [reports, setReports] = useState<Report[]>([]);
  const [clientName, setClientName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: client } = await supabase
        .from("clients")
        .select("id, name")
        .eq("slug", slug)
        .single();

      if (!client) {
        setLoading(false);
        return;
      }

      setClientName(client.name);

      const { data } = await supabase
        .from("generated_reports")
        .select("id, title, period, narrative, created_at")
        .eq("client_id", client.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setReports(data ?? []);
      setLoading(false);
    }

    load();
  }, [slug]);

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
          className="px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
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

      <h2 className="text-xl font-bold text-gray-900 mb-2">Reports</h2>
      <p className="text-sm text-gray-500 mb-6">
        {clientName
          ? `Performance reports for ${clientName}`
          : "Performance reports"}
      </p>

      {loading ? (
        <div className="text-sm text-gray-500 py-12 text-center">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No reports generated yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Your LeadCoverage team will publish reports here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border">
              <button
                type="button"
                onClick={() =>
                  setExpandedId(expandedId === report.id ? null : report.id)
                }
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {report.title ?? "Stage 7 Review"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {report.period ?? "--"} &middot;{" "}
                    {new Date(report.created_at).toLocaleDateString()}
                  </p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedId === report.id ? "rotate-90" : ""
                  }`}
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
              </button>
              {expandedId === report.id && report.narrative && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap pt-4">
                    {report.narrative}
                  </p>
                </div>
              )}
              {expandedId === report.id && !report.narrative && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <p className="text-sm text-gray-400 italic pt-4">
                    No narrative content available for this report.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
