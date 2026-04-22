export type BrainObjectType =
  | "company_intelligence"
  | "icp_definitions"
  | "personas"
  | "competitive_map"
  | "voice_model"
  | "message_matrix"
  | "content_index"
  | "campaign_history"
  | "hubspot_health"
  | "review_rules"
  | "key_contacts"
  | "goals_backwards_math"
  | "sow_scope"
  | "lc_edge_benchmarks";

export interface BrainObjectMeta {
  key: BrainObjectType;
  label: string;
  table: string;
  singleton: boolean;
  tier: "primary" | "strategy" | "operations" | "governance";
}

export const BRAIN_OBJECTS: BrainObjectMeta[] = [
  // Primary tier (always visible)
  {
    key: "company_intelligence",
    label: "Company Intelligence",
    table: "company_intelligence",
    singleton: true,
    tier: "primary",
  },
  {
    key: "icp_definitions",
    label: "ICP Definitions",
    table: "icp_definitions",
    singleton: false,
    tier: "primary",
  },
  {
    key: "personas",
    label: "Personas",
    table: "personas",
    singleton: false,
    tier: "primary",
  },
  {
    key: "message_matrix",
    label: "Message Matrix",
    table: "message_matrix",
    singleton: false,
    tier: "primary",
  },
  // Strategy tier (collapsible)
  {
    key: "competitive_map",
    label: "Competitive Map",
    table: "competitive_map",
    singleton: false,
    tier: "strategy",
  },
  {
    key: "voice_model",
    label: "Voice Model",
    table: "voice_model",
    singleton: true,
    tier: "strategy",
  },
  {
    key: "content_index",
    label: "Content Index",
    table: "content_index",
    singleton: false,
    tier: "strategy",
  },
  // Operations tier (collapsible)
  {
    key: "campaign_history",
    label: "Campaign History",
    table: "campaign_history",
    singleton: false,
    tier: "operations",
  },
  {
    key: "hubspot_health",
    label: "HubSpot Health",
    table: "hubspot_health",
    singleton: true,
    tier: "operations",
  },
  {
    key: "goals_backwards_math",
    label: "Goals & Backwards Math",
    table: "goals_backwards_math",
    singleton: false,
    tier: "operations",
  },
  {
    key: "sow_scope",
    label: "SOW & Scope",
    table: "sow_scope",
    singleton: true,
    tier: "operations",
  },
  // Governance tier (collapsible)
  {
    key: "key_contacts",
    label: "Key Contacts",
    table: "key_contacts",
    singleton: false,
    tier: "governance",
  },
  {
    key: "review_rules",
    label: "Review Rules",
    table: "review_rules",
    singleton: true,
    tier: "governance",
  },
  {
    key: "lc_edge_benchmarks",
    label: "LC Edge Benchmarks",
    table: "lc_edge_benchmarks",
    singleton: true,
    tier: "governance",
  },
];

export function getBrainObject(key: string): BrainObjectMeta | undefined {
  return BRAIN_OBJECTS.find((o) => o.key === key);
}
