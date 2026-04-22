import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const BRAIN_OBJECTS = [
  {
    key: "company_intelligence",
    label: "Company Intelligence",
    table: "company_intelligence",
  },
  {
    key: "icp_definitions",
    label: "ICP Definitions",
    table: "icp_definitions",
  },
  { key: "personas", label: "Personas", table: "personas" },
  {
    key: "competitive_map",
    label: "Competitive Map",
    table: "competitive_map",
  },
  { key: "voice_model", label: "Voice Model", table: "voice_model" },
  { key: "message_matrix", label: "Message Matrix", table: "message_matrix" },
  { key: "content_index", label: "Content Index", table: "content_index" },
  {
    key: "campaign_history",
    label: "Campaign History",
    table: "campaign_history",
  },
  { key: "hubspot_health", label: "HubSpot Health", table: "hubspot_health" },
  { key: "review_rules", label: "Review Rules", table: "review_rules" },
  { key: "key_contacts", label: "Key Contacts", table: "key_contacts" },
  {
    key: "goals_backwards_math",
    label: "Goals & Backwards Math",
    table: "goals_backwards_math",
  },
  { key: "sow_scope", label: "SOW & Scope", table: "sow_scope" },
  {
    key: "lc_edge_benchmarks",
    label: "LC Edge Benchmarks",
    table: "lc_edge_benchmarks",
  },
];

export default async function BrainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id, name")
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
        <h1 className="text-2xl font-bold text-gray-900">Client Brain</h1>
        <p className="text-sm text-gray-500 mt-1">
          14 intelligence objects that power personalization
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BRAIN_OBJECTS.map((obj) => (
          <Link
            key={obj.key}
            href={`/clients/${id}/brain/${obj.key}`}
            className="bg-white rounded-lg border p-4 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <h3 className="font-medium text-gray-900">{obj.label}</h3>
            <p className="text-xs text-gray-500 mt-1">Click to view & edit</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
