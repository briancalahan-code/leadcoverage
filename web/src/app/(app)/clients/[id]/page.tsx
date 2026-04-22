import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ClientPage({
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

  const tabs = [
    { href: `/clients/${id}`, label: "Overview" },
    { href: `/clients/${id}/brain`, label: "Brain" },
    { href: `/clients/${id}/pipeline`, label: "Pipeline" },
    { href: `/clients/${id}/settings`, label: "Settings" },
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/clients"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; All Clients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
        {client.website && (
          <p className="text-sm text-gray-500">{client.website}</p>
        )}
      </div>
      <nav className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="pb-2 text-sm font-medium text-gray-600 hover:text-blue-700 border-b-2 border-transparent hover:border-blue-700"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Pipeline Stage</h2>
          <p className="text-lg capitalize">
            {client.pipeline_stage?.replace("_", " ") || "Not started"}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Account Health</h2>
          <p className="text-lg capitalize">
            {client.account_health || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}
