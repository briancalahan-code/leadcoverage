"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Job, JobStatus } from "@/types/jobs";
import { ProgressBar } from "@/components/shared/progress-bar";

const STATUS_STYLES: Record<JobStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-700 animate-pulse",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

const TYPE_LABELS: Record<string, string> = {
  personalization: "Personalization",
  report_generation: "Report Generation",
  hubspot_sync: "HubSpot Sync",
  brain_populate: "Brain Populate",
};

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function truncateResult(result: Record<string, unknown> | null): string {
  if (!result) return "—";
  const text = JSON.stringify(result);
  return text.length > 80 ? text.slice(0, 80) + "…" : text;
}

export function JobQueueTable({
  clientId,
  initialJobs,
}: {
  clientId: string;
  initialJobs: Job[];
}) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs?client_id=${clientId}`);
      if (res.ok) {
        const data: Job[] = await res.json();
        setJobs(data);
      }
    } catch {
      // Silently retry on next interval
    }
  }, [clientId]);

  // Poll for running jobs every 3 seconds
  useEffect(() => {
    const hasRunning = jobs.some((j) => j.status === "running");
    if (hasRunning) {
      intervalRef.current = setInterval(fetchJobs, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [jobs, fetchJobs]);

  async function handleRetry(job: Job) {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          job_type: job.job_type,
          config: job.config,
        }),
      });
      if (res.ok) {
        await fetchJobs();
      }
    } catch {
      // Retry silently
    } finally {
      setLoading(false);
    }
  }

  if (jobs.length === 0) {
    return (
      <div className="text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed p-6 text-center">
        No jobs yet. Use the workflow cards above to start your first job.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Progress</th>
            <th className="px-4 py-3">Started</th>
            <th className="px-4 py-3">Completed</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {TYPE_LABELS[job.job_type] ?? job.job_type}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[job.status]}`}
                >
                  {job.status}
                </span>
              </td>
              <td className="px-4 py-3 w-40">
                {job.status === "running" ? (
                  <ProgressBar value={job.progress} />
                ) : job.status === "completed" ? (
                  <span className="text-xs text-gray-500">
                    {truncateResult(job.result)}
                  </span>
                ) : job.status === "failed" && job.error ? (
                  <span
                    className="text-xs text-red-600 truncate block max-w-[10rem]"
                    title={job.error}
                  >
                    {job.error}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">&mdash;</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {formatTime(job.started_at)}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {formatTime(job.completed_at)}
              </td>
              <td className="px-4 py-3">
                {job.status === "failed" && (
                  <button
                    onClick={() => handleRetry(job)}
                    disabled={loading}
                    className="text-xs font-medium px-2 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
