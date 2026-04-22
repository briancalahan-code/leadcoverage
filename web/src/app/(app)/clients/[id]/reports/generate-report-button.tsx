"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateReportButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: "last_30_days" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setGenerating(false);
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
    >
      {generating ? "Generating..." : "Generate Report"}
    </button>
  );
}
