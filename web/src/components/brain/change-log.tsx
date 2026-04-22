import { createClient } from "@/lib/supabase/server";
import { ChangeLogToggle } from "./change-log-toggle";

interface ChangeLogEntry {
  id: string;
  object_type: string;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  source: string | null;
  created_at: string;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatObjectType(objectType: string): string {
  return objectType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function ChangeLog({ clientId }: { clientId: string }) {
  const supabase = await createClient();

  const { data: entries } = await supabase
    .from("brain_change_log")
    .select(
      "id, object_type, field_changed, old_value, new_value, changed_by, source, created_at",
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(20);

  const logEntries: ChangeLogEntry[] = entries || [];

  // Fetch user names for changed_by IDs
  const userIds = [
    ...new Set(logEntries.map((e) => e.changed_by).filter(Boolean)),
  ] as string[];
  let userMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name")
      .in("id", userIds);
    if (users) {
      userMap = Object.fromEntries(
        users.map((u) => [u.id, u.full_name || "Unknown"]),
      );
    }
  }

  return (
    <ChangeLogToggle>
      {logEntries.length === 0 ? (
        <p className="text-sm text-gray-400 py-3">No changes recorded yet</p>
      ) : (
        <div className="space-y-1">
          {logEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-baseline gap-2 text-sm py-1.5 border-b border-gray-50 last:border-0"
            >
              <span className="text-xs text-gray-400 shrink-0 w-16 text-right">
                {formatRelativeTime(entry.created_at)}
              </span>
              <span className="text-gray-600">
                <span className="font-medium text-gray-700">
                  {entry.changed_by
                    ? userMap[entry.changed_by] || "System"
                    : "System"}
                </span>{" "}
                {entry.field_changed === "all"
                  ? "created"
                  : `updated ${entry.field_changed} on`}{" "}
                <span className="font-medium text-gray-700">
                  {formatObjectType(entry.object_type)}
                </span>
                {entry.source && entry.source !== "ui" && (
                  <span className="text-xs text-gray-400 ml-1">
                    via {entry.source}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </ChangeLogToggle>
  );
}
