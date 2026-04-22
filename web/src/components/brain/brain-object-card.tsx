import Link from "next/link";
import { StatusBadge, computeStatus } from "@/components/shared/status-badge";
import type { BrainObjectMeta } from "@/lib/brain-objects";

interface Props {
  meta: BrainObjectMeta;
  clientId: string;
  data: Record<string, unknown> | Record<string, unknown>[] | null;
}

export function BrainObjectCard({ meta, clientId, data }: Props) {
  const isEmpty = !data || (Array.isArray(data) && data.length === 0);
  const count = Array.isArray(data) ? data.length : data ? 1 : 0;

  let lastUpdated: string | null = null;
  if (Array.isArray(data) && data.length > 0) {
    lastUpdated = data[0].last_updated as string;
  } else if (data && !Array.isArray(data)) {
    lastUpdated = data.last_updated as string;
  }

  return (
    <Link
      href={`/clients/${clientId}/brain/${meta.key}`}
      className="bg-white rounded-lg border p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900 text-sm">{meta.label}</h3>
          <StatusBadge status={computeStatus(lastUpdated)} />
        </div>
        <p className="text-xs text-gray-500">
          {meta.singleton
            ? isEmpty
              ? "Not configured"
              : "Configured"
            : `${count} ${count === 1 ? "record" : "records"}`}
        </p>
      </div>
    </Link>
  );
}
