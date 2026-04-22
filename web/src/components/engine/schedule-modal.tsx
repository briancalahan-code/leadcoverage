"use client";

import { useEffect, useState, useCallback } from "react";
import type { JobType, JobSchedule } from "@/types/jobs";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  jobType: JobType;
  existingSchedule: JobSchedule | null;
}

type Cadence = "weekly" | "biweekly" | "monthly";
type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday";

const CADENCE_OPTIONS: { value: Cadence; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
];

const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
];

const JOB_TYPE_LABELS: Record<JobType, string> = {
  personalization: "Personalization",
  report_generation: "Report Generation",
  hubspot_sync: "HubSpot Sync",
  brain_populate: "Brain Populate",
};

function computeNextRunAt(cadence: Cadence, dayOfWeek: DayOfWeek): string {
  const dayMap: Record<DayOfWeek, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
  };

  const now = new Date();
  const targetDay = dayMap[dayOfWeek];
  const currentDay = now.getDay();
  let daysUntil = targetDay - currentDay;

  if (cadence === "monthly") {
    // Next 1st of month at 9am UTC
    const nextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      9,
      0,
      0,
    );
    return nextMonth.toISOString();
  }

  if (daysUntil <= 0) {
    daysUntil += cadence === "biweekly" ? 14 : 7;
  } else if (cadence === "biweekly") {
    // For biweekly, if target day is this week, push to next occurrence
    daysUntil += 7;
  }

  const next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(9, 0, 0, 0);
  return next.toISOString();
}

export function ScheduleModal({
  isOpen,
  onClose,
  clientId,
  jobType,
  existingSchedule,
}: ScheduleModalProps) {
  const isEdit = !!existingSchedule;

  const [cadence, setCadence] = useState<Cadence>(
    existingSchedule?.cadence ?? "weekly",
  );
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(
    (existingSchedule?.config?.day_of_week as DayOfWeek) ?? "monday",
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [configJson, setConfigJson] = useState(
    existingSchedule?.config
      ? JSON.stringify(existingSchedule.config, null, 2)
      : "{}",
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when schedule changes
  useEffect(() => {
    if (isOpen) {
      setCadence(existingSchedule?.cadence ?? "weekly");
      setDayOfWeek(
        (existingSchedule?.config?.day_of_week as DayOfWeek) ?? "monday",
      );
      setConfigJson(
        existingSchedule?.config
          ? JSON.stringify(existingSchedule.config, null, 2)
          : "{}",
      );
      setShowAdvanced(false);
      setError(null);
    }
  }, [isOpen, existingSchedule]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  async function handleSave() {
    setSaving(true);
    setError(null);

    let config: Record<string, unknown>;
    try {
      config = JSON.parse(configJson);
    } catch {
      setError("Invalid JSON in advanced config");
      setSaving(false);
      return;
    }

    // Merge day_of_week into config for weekly/biweekly
    if (cadence !== "monthly") {
      config = { ...config, day_of_week: dayOfWeek };
    }

    const nextRunAt = computeNextRunAt(cadence, dayOfWeek);

    const payload: Record<string, unknown> = {
      client_id: clientId,
      job_type: jobType,
      cadence,
      config,
      next_run_at: nextRunAt,
    };

    if (isEdit && existingSchedule) {
      payload.id = existingSchedule.id;
    }

    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to save schedule");
      }

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save schedule";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!existingSchedule) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/schedules?id=${existingSchedule.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to delete schedule");
      }

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete schedule";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  const showDayPicker = cadence === "weekly" || cadence === "biweekly";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Update" : "Create"} Schedule &mdash;{" "}
            {JOB_TYPE_LABELS[jobType]}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Cadence */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-2">
              Cadence
            </legend>
            <div className="flex gap-3">
              {CADENCE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 text-center cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    cadence === opt.value
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="cadence"
                    value={opt.value}
                    checked={cadence === opt.value}
                    onChange={() => setCadence(opt.value)}
                    className="sr-only"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Day of week */}
          {showDayPicker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
              >
                {DAY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Advanced config */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <span
                className={`inline-block transition-transform ${showAdvanced ? "rotate-90" : ""}`}
              >
                &#9654;
              </span>
              Advanced Config
            </button>
            {showAdvanced && (
              <textarea
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={5}
                placeholder='{"key": "value"}'
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm font-mono"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <div>
            {isEdit && (
              <button
                onClick={handleDelete}
                disabled={deleting || saving}
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Schedule"}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
