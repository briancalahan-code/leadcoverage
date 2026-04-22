"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CollectionFormModal } from "./collection-form-modal";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "json" | "tags" | "select" | "date" | "number";
  options?: string[];
  placeholder?: string;
  tableVisible?: boolean;
}

interface Props {
  clientId: string;
  objectKey: string;
  fields: FieldDef[];
  data: Record<string, unknown>[];
}

export function CollectionTable({ clientId, objectKey, fields, data }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<
    Record<string, unknown> | undefined
  >();

  const tableCols = fields.filter((f) => f.tableVisible);

  async function handleDelete(recordId: string) {
    if (!confirm("Delete this record? This cannot be undone.")) return;
    const res = await fetch(`/api/clients/${clientId}/brain/${objectKey}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record_id: recordId }),
    });
    if (res.ok) router.refresh();
  }

  function formatCell(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value).replace(/_/g, " ");
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditItem(undefined);
            setShowModal(true);
          }}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          + Add
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm bg-white rounded-lg border">
          No records yet. Click &quot;+ Add&quot; to create one.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {tableCols.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 font-medium text-gray-600"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="text-right px-4 py-3 font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.id as string}
                  className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setEditItem(row);
                    setShowModal(true);
                  }}
                >
                  {tableCols.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-900">
                      {formatCell(row[col.key])}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row.id as string);
                      }}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CollectionFormModal
          clientId={clientId}
          objectKey={objectKey}
          fields={fields}
          initialData={editItem}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
