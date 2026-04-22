import Link from "next/link";

interface Activity {
  id: string;
  actor_name: string | null;
  action: string;
  object_type: string | null;
  object_label: string | null;
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

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
      </div>
      {activities.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">No recent activity</p>
      ) : (
        <div className="divide-y">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-baseline gap-2 px-4 py-2.5 text-sm"
            >
              <span className="text-xs text-gray-400 shrink-0 w-16 text-right">
                {formatRelativeTime(activity.created_at)}
              </span>
              <span className="text-gray-600">
                <span className="font-medium text-gray-700">
                  {activity.actor_name ?? "System"}
                </span>{" "}
                {activity.action}
                {activity.object_type && (
                  <>
                    {" "}
                    <span className="font-medium text-gray-700">
                      {activity.object_label ??
                        formatObjectType(activity.object_type)}
                    </span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="p-3 border-t text-center">
        <Link
          href="#"
          className="text-xs font-medium text-blue-600 hover:text-blue-800"
        >
          View All
        </Link>
      </div>
    </div>
  );
}
