"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<{
    name: string;
    website: string | null;
    pipeline_stage: string | null;
    account_health: string | null;
  } | null>(null);

  useEffect(() => {
    async function fetchClient() {
      const res = await fetch(`/api/clients/${params.id}`);
      if (!res.ok) {
        setError("Failed to load client");
        setFetching(false);
        return;
      }
      const data = await res.json();
      setClient(data);
      setFetching(false);
    }
    fetchClient();
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      name: formData.get("name") as string,
      website: (formData.get("website") as string) || null,
    };

    const res = await fetch(`/api/clients/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update client");
      setLoading(false);
      return;
    }

    router.push(`/clients/${params.id}`);
  }

  if (fetching) {
    return (
      <div className="p-8 max-w-2xl">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-8 max-w-2xl">
        <p className="text-red-600">Client not found</p>
        <Link
          href="/clients"
          className="text-sm text-blue-700 hover:underline mt-2 inline-block"
        >
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <Link
        href={`/clients/${params.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
      >
        &larr; Back to Client
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Client</h1>
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Client Name *
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={client.name}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            placeholder="https://"
            defaultValue={client.website || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/clients/${params.id}`}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
