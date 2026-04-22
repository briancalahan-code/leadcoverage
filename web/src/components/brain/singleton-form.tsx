"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  initialData: Record<string, unknown> | null;
}

export function SingletonForm({
  clientId,
  objectKey,
  fields,
  initialData,
}: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, unknown>>(
    initialData || {},
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateField(key: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/clients/${clientId}/brain/${objectKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Saved");
      router.refresh();
      setTimeout(() => setMessage(null), 2000);
    } else {
      const err = await res.json();
      setMessage(`Error: ${err.error}`);
    }
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              value={(formData[field.key] as string) || ""}
              onChange={(e) => updateField(field.key, e.target.value)}
              placeholder={field.placeholder}
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
              onChange={(e) => updateField(field.key, e.target.value || null)}
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
              onChange={(e) => updateField(field.key, e.target.value || null)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
          )}
        </div>
      ))}
      <div className="flex items-center gap-3 pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {message && (
          <span
            className={`text-sm ${message.startsWith("Error") ? "text-red-600" : "text-emerald-600"}`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
