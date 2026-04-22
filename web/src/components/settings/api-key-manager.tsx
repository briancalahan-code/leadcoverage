"use client";

import { useCallback, useEffect, useState } from "react";
import type { IntegrationKey } from "@/types/database";

const SERVICE_OPTIONS = ["hubspot", "clay", "bombora", "sixsense"] as const;

type KeyMeta = Pick<
  IntegrationKey,
  "id" | "service_name" | "is_active" | "created_at" | "updated_at"
>;

export function ApiKeyManager({ clientId }: { clientId: string }) {
  const [keys, setKeys] = useState<KeyMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formService, setFormService] = useState<string>(SERVICE_OPTIONS[0]);
  const [formKey, setFormKey] = useState("");
  const [formSecret, setFormSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}/integrations/keys`);
      if (!res.ok) throw new Error("Failed to load keys");
      const data: KeyMeta[] = await res.json();
      setKeys(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load keys");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/integrations/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: formService,
          api_key: formKey,
          ...(formSecret ? { secret: formSecret } : {}),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save key");
      }
      setShowForm(false);
      setFormKey("");
      setFormSecret("");
      await fetchKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save key");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(keyId: string) {
    try {
      const res = await fetch(
        `/api/clients/${clientId}/integrations/keys?key_id=${keyId}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Failed to deactivate key");
      setDeleteConfirm(null);
      await fetchKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to deactivate key");
    }
  }

  function openRotate(key: KeyMeta) {
    setFormService(key.service_name);
    setFormKey("");
    setFormSecret("");
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500 animate-pulse py-4">
        Loading integration keys...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {keys.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 capitalize">
                    {k.service_name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        k.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {k.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(k.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    {k.is_active && (
                      <>
                        <button
                          onClick={() => openRotate(k)}
                          className="text-xs font-medium px-2 py-1 rounded-md border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          Rotate
                        </button>
                        {deleteConfirm === k.id ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-xs text-gray-500">
                              Confirm?
                            </span>
                            <button
                              onClick={() => handleDelete(k.id)}
                              className="text-xs font-medium px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs font-medium px-2 py-1 rounded-md border text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              No
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(k.id)}
                            className="text-xs font-medium px-2 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {keys.length === 0 && !showForm && (
        <p className="text-sm text-gray-500">
          No integration keys configured yet.
        </p>
      )}

      {showForm ? (
        <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            {keys.some((k) => k.service_name === formService)
              ? "Rotate Key"
              : "Add Integration Key"}
          </h3>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              value={formService}
              onChange={(e) => setFormService(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SERVICE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={formKey}
              onChange={(e) => setFormKey(e.target.value)}
              placeholder="Enter API key"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Secret (optional)
            </label>
            <input
              type="password"
              value={formSecret}
              onChange={(e) => setFormSecret(e.target.value)}
              placeholder="Enter secret"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !formKey}
              className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setFormKey("");
                setFormSecret("");
              }}
              className="text-sm font-medium px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setFormService(SERVICE_OPTIONS[0]);
            setShowForm(true);
          }}
          className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Add Key
        </button>
      )}
    </div>
  );
}
