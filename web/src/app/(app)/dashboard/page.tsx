import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, pipeline_stage, account_health")
    .order("updated_at", { ascending: false })
    .limit(10);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-3xl font-bold text-gray-900">
            {clients?.length ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Active Pipeline</p>
          <p className="text-3xl font-bold text-gray-900">
            {clients?.filter((c) => c.pipeline_stage !== "stage_7").length ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500">Needs Attention</p>
          <p className="text-3xl font-bold text-red-600">
            {clients?.filter((c) => c.account_health === "red").length ?? 0}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Recent Clients</h2>
        </div>
        <div className="divide-y">
          {clients?.map((client) => (
            <a
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{client.name}</span>
              <span className="text-sm text-gray-500">
                {client.pipeline_stage?.replace("_", " ")}
              </span>
            </a>
          ))}
          {(!clients || clients.length === 0) && (
            <p className="p-4 text-gray-500 text-sm">
              No clients yet. Add your first client to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
