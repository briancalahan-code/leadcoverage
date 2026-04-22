export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div
      className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-blue-600 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
