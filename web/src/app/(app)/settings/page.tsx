"use client";

import { useEffect, useState } from "react";

const TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Phoenix",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
];

interface OrgSettings {
  id: string;
  name: string;
  billing_email?: string;
  default_timezone?: string;
  notification_preferences?: {
    email_alerts: boolean;
    weekly_digest: boolean;
    pipeline_updates: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [pipelineUpdates, setPipelineUpdates] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data: OrgSettings = await res.json();
          setSettings(data);
          setName(data.name || "");
          setBillingEmail(data.billing_email || "");
          setTimezone(data.default_timezone || "America/New_York");
          setEmailAlerts(data.notification_preferences?.email_alerts ?? true);
          setWeeklyDigest(data.notification_preferences?.weekly_digest ?? true);
          setPipelineUpdates(
            data.notification_preferences?.pipeline_updates ?? true,
          );
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          billing_email: billingEmail,
          default_timezone: timezone,
          notification_preferences: {
            email_alerts: emailAlerts,
            weekly_digest: weeklyDigest,
            pipeline_updates: pipelineUpdates,
          },
        }),
      });
      if (res.ok) {
        setToast("Settings saved successfully");
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Failed to save settings");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Organization Settings
        </h1>
        <div className="text-sm text-gray-500 animate-pulse">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Organization Settings
      </h1>

      {toast && (
        <div
          className={`mb-4 text-sm px-4 py-2 rounded-md ${
            toast.includes("Failed")
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {toast}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">General</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Email
            </label>
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="billing@company.com"
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">
            Notification Preferences
          </h2>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Email alerts for critical events
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Weekly performance digest
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={pipelineUpdates}
              onChange={(e) => setPipelineUpdates(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Pipeline stage change notifications
            </span>
          </label>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Billing</h2>
          <p className="text-sm text-gray-500">
            Manage your subscription and billing details.
          </p>
        </div>

        <div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
