import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email, role, organizations(name)");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-gray-900">Users</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-gray-500">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Organization</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{u.full_name}</td>
                <td className="p-4 text-sm text-gray-600">{u.email}</td>
                <td className="p-4 text-sm capitalize text-gray-600">
                  {u.role}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {(u.organizations as any)?.name || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
