"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PipelineStage } from "@/lib/pipeline-stages";
import { getBrainObject } from "@/lib/brain-objects";

interface StageCardProps {
  stage: PipelineStage;
  clientId: string;
  isCurrent: boolean;
  isCompleted: boolean;
  prereqs: { met: boolean; missing: string[] };
  onAdvance?: () => void;
}

export function StageCard({
  stage,
  clientId,
  isCurrent,
  isCompleted,
  prereqs,
  onAdvance,
}: StageCardProps) {
  const router = useRouter();
  const [advancing, setAdvancing] = useState(false);

  const borderColor = isCompleted
    ? "border-emerald-300"
    : isCurrent
      ? "border-indigo-400 ring-1 ring-indigo-400"
      : "border-gray-200";

  const bgColor = isCompleted
    ? "bg-emerald-50/50"
    : isCurrent
      ? "bg-indigo-50/50"
      : "bg-white";

  const numberBg = isCompleted
    ? "bg-emerald-100 text-emerald-700"
    : isCurrent
      ? "bg-indigo-100 text-indigo-700"
      : "bg-gray-100 text-gray-400";

  function labelFor(key: string): string {
    return getBrainObject(key)?.label ?? key;
  }

  async function handleAdvance() {
    if (!onAdvance) return;
    setAdvancing(true);
    onAdvance();
  }

  const firstWriteKey = stage.writes[0];
  const isFuture = !isCurrent && !isCompleted;

  return (
    <div
      className={`rounded-lg border p-5 transition-all duration-200 ${borderColor} ${bgColor} ${isFuture && !prereqs.met ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-4">
        {/* Stage number badge */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${numberBg}`}
        >
          {isCompleted ? (
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            stage.number
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              Stage {stage.number}: {stage.name}
            </h3>
            {isCurrent && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                Current
              </span>
            )}
            {isCompleted && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                Complete
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{stage.description}</p>

          {/* Reads */}
          {stage.reads.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-gray-500 mr-2">
                Reads:
              </span>
              <div className="inline-flex flex-wrap gap-1">
                {stage.reads.map((key) => (
                  <Link
                    key={key}
                    href={`/clients/${clientId}/brain/${key}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    {labelFor(key)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Writes */}
          {stage.writes.length > 0 && (
            <div className="mb-3">
              <span className="text-xs font-medium text-gray-500 mr-2">
                Writes:
              </span>
              <div className="inline-flex flex-wrap gap-1">
                {stage.writes.map((key) => (
                  <Link
                    key={key}
                    href={`/clients/${clientId}/brain/${key}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                  >
                    {labelFor(key)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Missing prereqs warning */}
          {!prereqs.met && !isCompleted && (
            <div className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 mb-3">
              Missing prerequisites:{" "}
              {prereqs.missing.map((k) => labelFor(k)).join(", ")}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isCurrent && firstWriteKey && (
              <button
                onClick={() =>
                  router.push(`/clients/${clientId}/brain/${firstWriteKey}`)
                }
                className="text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Start Stage
              </button>
            )}
            {isCurrent && onAdvance && (
              <button
                onClick={handleAdvance}
                disabled={advancing}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                {advancing ? "Advancing..." : "Advance to Next Stage"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
