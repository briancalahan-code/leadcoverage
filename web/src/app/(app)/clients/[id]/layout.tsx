import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ClientTabs } from "./client-tabs";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, website, pipeline_stage, account_health")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const healthColors: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-800",
    yellow: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-6 pb-0 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link
              href="/clients"
              className="text-sm text-gray-500 hover:text-gray-700 mb-1 inline-block"
            >
              &larr; All Clients
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{client.name}</h1>
              {client.account_health && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${healthColors[client.account_health] || "bg-gray-100 text-gray-600"}`}
                >
                  {client.account_health}
                </span>
              )}
            </div>
            {client.website && (
              <p className="text-sm text-gray-500">{client.website}</p>
            )}
          </div>
          <Link
            href={`/clients/${id}/edit`}
            className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg"
          >
            Edit
          </Link>
        </div>
        <ClientTabs clientId={id} />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
