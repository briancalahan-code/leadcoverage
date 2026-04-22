import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClientSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/clients/${id}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; {client.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Client Settings</h1>
      </div>
      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">API Integrations</h2>
          <p className="text-sm text-gray-500">
            Manage HubSpot, Clay, and other API keys for this client.
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Team</h2>
          <p className="text-sm text-gray-500">
            Assign team members to this client account.
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">SOW & Contract</h2>
          <p className="text-sm text-gray-500">
            View and manage scope of work details.
          </p>
        </div>
      </div>
    </div>
  );
}
