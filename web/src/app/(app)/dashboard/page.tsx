import { createClient } from "@/lib/supabase/server";
import { BRAIN_OBJECTS } from "@/lib/brain-objects";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";
import { HealthGrid } from "@/components/dashboard/health-grid";
import { StaleAlerts } from "@/components/dashboard/stale-alerts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import type { PipelineStage, AccountHealth } from "@/types/database";

const STALE_THRESHOLD_DAYS = 30;

// Map of brain object tables that have a last_updated column
const STALE_TABLES = BRAIN_OBJECTS.map((o) => ({
  key: o.key,
  table: o.table,
  label: o.label,
}));

const stageColors: Record<string, string> = {
  stage_1: "bg-blue-500",
  stage_2: "bg-indigo-500",
  stage_3: "bg-purple-500",
  stage_4: "bg-pink-500",
  stage_5: "bg-orange-500",
  stage_6: "bg-amber-500",
  stage_7: "bg-emerald-500",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const cutoffDate = new Date(
    Date.now() - STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Parallel data fetching
  const [clientsResult, changeLogResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, pipeline_stage, account_health")
      .order("updated_at", { ascending: false }),
    supabase
      .from("brain_change_log")
      .select(
        "id, client_id, object_type, field_changed, changed_by, source, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const clients =
    (clientsResult.data as Array<{
      id: string;
      name: string;
      pipeline_stage: PipelineStage | null;
      account_health: AccountHealth | null;
    }>) ?? [];

  const changeLogEntries = changeLogResult.data ?? [];

  // Build client name lookup
  const clientMap: Record<string, string> = {};
  for (const c of clients) {
    clientMap[c.id] = c.name;
  }

  // Fetch user names for change log actors
  const actorIds = [
    ...new Set(changeLogEntries.map((e) => e.changed_by).filter(Boolean)),
  ] as string[];
  let userMap: Record<string, string> = {};
  if (actorIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name")
      .in("id", actorIds);
    if (users) {
      userMap = Object.fromEntries(
        users.map((u) => [u.id, u.full_name || "Unknown"]),
      );
    }
  }

  // Map change log entries to activity feed format
  const activities = changeLogEntries.map((entry) => ({
    id: entry.id as string,
    actor_name: entry.changed_by
      ? (userMap[entry.changed_by] ?? "System")
      : "System",
    action:
      entry.field_changed === "all"
        ? "created"
        : `updated ${entry.field_changed ?? "field"} on`,
    object_type: entry.object_type as string,
    object_label: null as string | null,
    created_at: entry.created_at as string,
  }));

  // Fetch stale brain objects across all tables in parallel
  const stalePromises = STALE_TABLES.map(async (table) => {
    const { data } = await supabase
      .from(table.table)
      .select("client_id, last_updated")
      .lt("last_updated", cutoffDate);
    return (data ?? []).map(
      (row: { client_id: string; last_updated: string }) => ({
        clientId: row.client_id,
        clientName: clientMap[row.client_id] ?? "Unknown",
        objectKey: table.key,
        objectLabel: table.label,
        lastUpdated: row.last_updated,
      }),
    );
  });

  const staleResults = await Promise.all(stalePromises);
  const staleObjects = staleResults.flat();

  // Stat calculations
  const totalClients = clients.length;
  const activePipeline = clients.filter(
    (c) => c.pipeline_stage !== "stage_7",
  ).length;
  const needsAttention = clients.filter(
    (c) => c.account_health === "red",
  ).length;

  // Pipeline stage distribution
  const stageCounts: Record<string, number> = {};
  for (const c of clients) {
    const stage = c.pipeline_stage ?? "none";
    stageCounts[stage] = (stageCounts[stage] ?? 0) + 1;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Top row: stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-3xl font-bold text-gray-900">{totalClients}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Active Pipeline</p>
          <p className="text-3xl font-bold text-gray-900">{activePipeline}</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Needs Attention</p>
          <p className="text-3xl font-bold text-red-600">{needsAttention}</p>
        </div>
      </div>

      {/* Pipeline stage distribution bar */}
      {totalClients > 0 && (
        <div className="bg-white rounded-lg border p-4 mb-8">
          <h2 className="font-semibold text-gray-900 text-sm mb-3">
            Pipeline Distribution
          </h2>
          <div className="flex rounded-full overflow-hidden h-4">
            {PIPELINE_STAGES.map((stage) => {
              const count = stageCounts[stage.key] ?? 0;
              if (count === 0) return null;
              const pct = (count / totalClients) * 100;
              return (
                <div
                  key={stage.key}
                  className={`${stageColors[stage.key] ?? "bg-gray-400"}`}
                  style={{ width: `${pct}%` }}
                  title={`S${stage.number}: ${stage.name} (${count})`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {PIPELINE_STAGES.map((stage) => {
              const count = stageCounts[stage.key] ?? 0;
              if (count === 0) return null;
              return (
                <div
                  key={stage.key}
                  className="flex items-center gap-1.5 text-xs text-gray-600"
                >
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${stageColors[stage.key] ?? "bg-gray-400"}`}
                  />
                  S{stage.number}: {stage.name} ({count})
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Second row: Health Grid */}
      <div className="mb-8">
        <HealthGrid clients={clients} />
      </div>

      {/* Third row: Stale Alerts + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaleAlerts staleObjects={staleObjects} />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
