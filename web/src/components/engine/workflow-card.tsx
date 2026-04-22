"use client";

import { useState } from "react";
import type { JobType, JobSchedule } from "@/types/jobs";
import { ScheduleModal } from "./schedule-modal";

interface WorkflowCardProps {
  title: string;
  description: string;
  icon: string;
  jobType: JobType;
  clientId: string;
  activeSchedule: string | null;
}

export function WorkflowCard({
  title,
  description,
  icon,
  jobType,
  clientId,
  activeSchedule,
}: WorkflowCardProps) {
  const [running, setRunning] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleRunNow() {
    setRunning(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          job_type: jobType,
          config: {},
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to start job");
      }

      setFeedback({ type: "success", message: "Job started" });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to start job";
      setFeedback({ type: "error", message });
    } finally {
      setRunning(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  }

  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl" role="img" aria-label={title}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {activeSchedule && (
              <span className="text-xs font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                {activeSchedule}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`text-xs rounded px-2 py-1.5 mb-3 ${
            feedback.type === "success"
              ? "text-emerald-700 bg-emerald-50"
              : "text-red-700 bg-red-50"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleRunNow}
          disabled={running}
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {running ? "Starting..." : "Run Now"}
        </button>
        <button
          onClick={() => setScheduleOpen(true)}
          className="text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Schedule
        </button>
      </div>

      <ScheduleModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        clientId={clientId}
        jobType={jobType}
        existingSchedule={null}
      />
    </div>
  );
}
