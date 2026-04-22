"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserRole } from "@/types/database";

const ROLES: UserRole[] = [
  "admin",
  "strategist",
  "sdr",
  "demand_gen",
  "viewer",
];

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  org_id: string;
  created_at: string;
  organizations?: { name: string } | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<string | null>(
    null,
  );

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        setIsAdmin(false);
        return;
      }
      if (res.ok) {
        const data: UserRow[] = await res.json();
        setUsers(data);
      }
    } catch {
      // Silently handle
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleInvite() {
    if (!inviteName || !inviteEmail) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: inviteName,
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      if (res.ok) {
        setShowInvite(false);
        setInviteName("");
        setInviteEmail("");
        setInviteRole("viewer");
        showToast("User invited successfully");
        await fetchUsers();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to invite user");
      }
    } catch {
      showToast("Failed to invite user");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: UserRole) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
        );
        showToast("Role updated");
      }
    } catch {
      showToast("Failed to update role");
    }
  }

  async function handleDeactivate(userId: string) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, is_active: false }),
      });
      if (res.ok) {
        setDeactivateConfirm(null);
        showToast("User deactivated");
        await fetchUsers();
      }
    } catch {
      showToast("Failed to deactivate user");
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
        <div className="text-sm text-gray-500 animate-pulse">
          Loading users...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-700">
          You do not have permission to access the admin panel. Contact your
          organization administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Invite User
        </button>
      </div>

      {toast && (
        <div
          className={`mb-4 text-sm px-4 py-2 rounded-md ${
            toast.includes("Failed") || toast.includes("error")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {toast}
        </div>
      )}

      {showInvite && (
        <div className="bg-white rounded-lg border p-6 mb-6 space-y-4 max-w-xl">
          <h2 className="font-semibold text-gray-900">Invite New User</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="jane@company.com"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleInvite}
              disabled={saving || !inviteName || !inviteEmail}
              className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Sending..." : "Send Invite"}
            </button>
            <button
              onClick={() => setShowInvite(false)}
              className="text-sm font-medium px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium text-gray-900">{u.full_name}</td>
                <td className="p-4 text-sm text-gray-600">{u.email}</td>
                <td className="p-4">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value as UserRole)
                    }
                    className="text-sm border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {(u.organizations as { name: string } | null)?.name || "—"}
                </td>
                <td className="p-4">
                  {deactivateConfirm === u.id ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="text-xs text-gray-500">Confirm?</span>
                      <button
                        onClick={() => handleDeactivate(u.id)}
                        className="text-xs font-medium px-2 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setDeactivateConfirm(null)}
                        className="text-xs font-medium px-2 py-1 rounded-md border text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        No
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeactivateConfirm(u.id)}
                      className="text-xs font-medium px-2 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
