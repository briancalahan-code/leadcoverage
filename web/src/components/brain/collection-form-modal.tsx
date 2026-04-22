"use client";

import { useState } from "react";

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "json" | "tags" | "select" | "date" | "number";
  options?: string[];
  placeholder?: string;
}

interface Props {
  clientId: string;
  objectKey: string;
  fields: FieldDef[];
  initialData?: Record<string, unknown>;
  onClose: () => void;
  onSaved: () => void;
}

export function CollectionFormModal({
  clientId,
  objectKey,
  fields,
  initialData,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!initialData?.id;
  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialData || {},
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const method = isEdit ? "PATCH" : "POST";
    const body = isEdit
      ? { ...formData, record_id: initialData?.id }
      : formData;

    const res = await fetch(`/api/clients/${clientId}/brain/${objectKey}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json();
      setError(data.error || "Save failed");
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit" : "Add"} Record
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={(formData[field.key] as string) || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              ) : field.type === "tags" ? (
                <input
                  value={
                    Array.isArray(formData[field.key])
                      ? (formData[field.key] as string[]).join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    updateField(
                      field.key,
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  placeholder={field.placeholder || "Comma-separated values"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              ) : field.type === "json" ? (
                <textarea
                  value={
                    formData[field.key]
                      ? JSON.stringify(formData[field.key], null, 2)
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      updateField(field.key, JSON.parse(e.target.value));
                    } catch {
                      /* allow partial edits */
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-mono"
                />
              ) : field.type === "select" ? (
                <select
                  value={(formData[field.key] as string) || ""}
                  onChange={(e) =>
                    updateField(field.key, e.target.value || null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              ) : field.type === "number" ? (
                <input
                  type="number"
                  value={(formData[field.key] as number) ?? ""}
                  onChange={(e) =>
                    updateField(
                      field.key,
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              ) : (
                <input
                  type={field.type === "date" ? "date" : "text"}
                  value={(formData[field.key] as string) || ""}
                  onChange={(e) =>
                    updateField(field.key, e.target.value || null)
                  }
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
