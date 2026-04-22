import Link from "next/link";

interface StaleObject {
  clientId: string;
  clientName: string;
  objectKey: string;
  objectLabel: string;
  lastUpdated: string;
}

interface StaleClientGroup {
  clientId: string;
  clientName: string;
  staleCount: number;
}

export function StaleAlerts({ staleObjects }: { staleObjects: StaleObject[] }) {
  if (staleObjects.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="p-4 border-b -mx-6 -mt-6 mb-4">
          <h2 className="font-semibold text-gray-900">Stale Brain Objects</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">
          <svg
            className="w-4 h-4 text-emerald-600 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          All brain objects up to date
        </div>
      </div>
    );
  }

  // Group stale objects by client
  const grouped: Record<string, StaleClientGroup> = {};
  for (const obj of staleObjects) {
    if (!grouped[obj.clientId]) {
      grouped[obj.clientId] = {
        clientId: obj.clientId,
        clientName: obj.clientName,
        staleCount: 0,
      };
    }
    grouped[obj.clientId].staleCount++;
  }

  const groups = Object.values(grouped).sort(
    (a, b) => b.staleCount - a.staleCount,
  );

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-gray-900">Stale Brain Objects</h2>
      </div>
      <div className="divide-y">
        {groups.map((group) => (
          <div
            key={group.clientId}
            className="flex items-center justify-between px-4 py-3 bg-amber-50 border-amber-200"
          >
            <div>
              <span className="text-sm font-medium text-gray-900">
                {group.clientName}
              </span>
              <span className="text-xs text-amber-700 ml-2">
                {group.staleCount} stale{" "}
                {group.staleCount === 1 ? "object" : "objects"}
              </span>
            </div>
            <Link
              href={`/clients/${group.clientId}/brain`}
              className="text-xs font-medium text-amber-700 hover:text-amber-900 underline"
            >
              Review
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
