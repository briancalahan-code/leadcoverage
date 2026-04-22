export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Organization Settings
      </h1>
      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Team Management</h2>
          <p className="text-sm text-gray-500">
            Invite and manage team members across your organization.
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">API Keys</h2>
          <p className="text-sm text-gray-500">
            Manage organization-level API integrations (HubSpot, Clay, etc.).
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Billing</h2>
          <p className="text-sm text-gray-500">
            Manage your subscription and billing details.
          </p>
        </div>
      </div>
    </div>
  );
}
