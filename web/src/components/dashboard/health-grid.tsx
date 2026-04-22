import Link from "next/link";
import type { PipelineStage, AccountHealth } from "@/types/database";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";

interface ClientHealth {
  id: string;
  name: string;
  account_health: AccountHealth | null;
  pipeline_stage: PipelineStage | null;
}

const healthBorder: Record<string, string> = {
  green: "border-emerald-400",
  yellow: "border-amber-400",
  red: "border-red-400",
};

const healthDot: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

function stageLabel(stage: PipelineStage | null): string {
  if (!stage) return "No Stage";
  const found = PIPELINE_STAGES.find((s) => s.key === stage);
  return found ? `S${found.number}: ${found.name}` : stage;
}

export function HealthGrid({ clients }: { clients: ClientHealth[] }) {
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <p className="text-sm text-gray-500">
          No clients yet. Add your first client to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">Client Health Overview</h2>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {clients.map((client) => {
          const health = client.account_health ?? "unknown";
          const border =
            health === "unknown"
              ? "border-gray-300"
              : (healthBorder[health] ?? "border-gray-300");
          const dot =
            health === "unknown"
              ? "bg-gray-400"
              : (healthDot[health] ?? "bg-gray-400");

          return (
            <Link
              key={client.id}
              href={`/clients/${client.id}/brain`}
              className={`rounded-lg border-2 ${border} p-3 hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${dot}`}
                />
                <span className="font-medium text-gray-900 text-sm truncate">
                  {client.name}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {stageLabel(client.pipeline_stage)}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
