"use client";

import { useRouter } from "next/navigation";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Delete "${clientName}"? This cannot be undone.`)) return;

    const res = await fetch(`/api/clients/${clientId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-600 hover:text-red-800 font-medium"
    >
      Delete
    </button>
  );
}
