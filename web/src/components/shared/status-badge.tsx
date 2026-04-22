type Status = "green" | "amber" | "red" | "missing";

const styles: Record<Status, string> = {
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  missing: "bg-gray-100 text-gray-500",
};

const labels: Record<Status, string> = {
  green: "Current",
  amber: "Stale",
  red: "Needs Update",
  missing: "Missing",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function computeStatus(lastUpdated: string | null): Status {
  if (!lastUpdated) return "missing";
  const days =
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 30) return "green";
  if (days < 90) return "amber";
  return "red";
}
