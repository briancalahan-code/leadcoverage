import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { DeleteClientButton } from "./delete-client-button";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, website, pipeline_stage, account_health, updated_at")
    .order("name");

  const healthColors = {
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <Link
          href="/clients/new"
          className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          Add Client
        </Link>
      </div>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Pipeline Stage</th>
              <th className="p-4 font-medium">Health</th>
              <th className="p-4 font-medium">Last Updated</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients?.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {client.name}
                  </Link>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {client.pipeline_stage?.replace("_", " ")}
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${healthColors[client.account_health as keyof typeof healthColors] || "bg-gray-100 text-gray-800"}`}
                  >
                    {client.account_health}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {client.updated_at
                    ? new Date(client.updated_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-4">
                  <DeleteClientButton
                    clientId={client.id}
                    clientName={client.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!clients || clients.length === 0) && (
          <p className="p-8 text-center text-gray-500">No clients yet.</p>
        )}
      </div>
    </div>
  );
}
