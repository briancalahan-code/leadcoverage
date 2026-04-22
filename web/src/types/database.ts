export type AccountHealth = "green" | "yellow" | "red";
export type SectionStatus =
  | "draft"
  | "lc_reviewed"
  | "client_approved"
  | "needs_refresh";
export type WatchPriority = "watch_closely" | "monitor" | "low_priority";
export type FundingType = "bootstrapped" | "pe_backed" | "vc_backed" | "public";
export type CompanySize = "1-50" | "51-200" | "201-500" | "501-1000" | "1000+";
export type PersonaPriority = "primary" | "secondary" | "tertiary";
export type BuyingRole =
  | "economic_buyer"
  | "influencer"
  | "champion"
  | "blocker"
  | "end_user";
export type MessageDimension = "persona" | "market_condition" | "icp";
export type CampaignStatus = "active" | "completed" | "paused" | "cancelled";
export type ContentFormat =
  | "blog"
  | "case_study"
  | "white_paper"
  | "video"
  | "webinar"
  | "infographic"
  | "email"
  | "social_post"
  | "press_release"
  | "analyst_report"
  | "index"
  | "podcast"
  | "speaking_engagement";
export type PerformanceCategory =
  | "best_performing"
  | "solid"
  | "underperformed"
  | "content_graveyard";
export type GoalStatus = "green" | "yellow" | "red";
export type ContractStatus = "active" | "paused" | "churned" | "upsell";
export type PipelineStage =
  | "stage_1"
  | "stage_2"
  | "stage_3"
  | "stage_4"
  | "stage_5"
  | "stage_6"
  | "stage_7";
export type UserRole = "admin" | "strategist" | "sdr" | "demand_gen" | "viewer";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface User {
  id: string;
  org_id: string;
  role: UserRole;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Client {
  id: string;
  org_id: string;
  name: string;
  website: string | null;
  pipeline_stage: PipelineStage | null;
  account_health: AccountHealth | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyIntelligence {
  client_id: string;
  what_they_sell: string | null;
  who_they_sell_to: string | null;
  why_they_win: string | null;
  why_they_lose: string | null;
  business_goal: string | null;
  gtm_challenge: string | null;
  product_overview: string | null;
  sales_handoff_notes: Record<string, unknown> | null;
  seasonal_intelligence: Record<string, unknown> | null;
  win_loss_log: Record<string, unknown> | null;
  icp_validation_notes: Record<string, unknown> | null;
  section_status: SectionStatus | null;
  last_updated: string | null;
}

export interface ICPDefinition {
  id: string;
  client_id: string;
  name: string;
  company_size_range: CompanySize | null;
  industry_vertical: string[] | null;
  geography: string[] | null;
  funding_type: FundingType | null;
  tech_stack_signals: string[] | null;
  buying_triggers: Record<string, unknown> | null;
  deal_size_range: string | null;
  avg_sales_cycle: string | null;
  disqualifiers: string[] | null;
  priority: PersonaPriority | null;
  tam_estimate: string | null;
  customer_list_loaded: boolean | null;
  section_status: SectionStatus | null;
  last_updated: string | null;
}

export interface Persona {
  id: string;
  client_id: string;
  name: string;
  title_variants: string[] | null;
  priority: PersonaPriority | null;
  buying_role: BuyingRole | null;
  pain_points: string[] | null;
  values: string[] | null;
  research_channels: string[] | null;
  contact_preference: string | null;
  communication_style: string | null;
  section_status: SectionStatus | null;
  last_updated: string | null;
}

export interface PersonaICPLink {
  persona_id: string;
  icp_id: string;
}

export interface CompetitiveMap {
  id: string;
  client_id: string;
  competitor_name: string;
  positioning: string | null;
  strengths: string | null;
  weaknesses: string | null;
  recent_moves: string | null;
  differentiators: string | null;
  win_loss_summary: string | null;
  objections: Record<string, unknown> | null;
  watch_priority: WatchPriority | null;
  section_status: SectionStatus | null;
  approved_by: string | null;
  approval_date: string | null;
  last_updated: string | null;
}

export interface VoiceModel {
  client_id: string;
  founder_name: string | null;
  founder_linkedin: string | null;
  brand_tone_summary: string | null;
  communication_style: string | null;
  credible_topics: string[] | null;
  avoid_topics: string[] | null;
  phrases_they_use: string[] | null;
  phrases_they_avoid: string[] | null;
  sample_content_good: Record<string, unknown> | null;
  sample_content_bad: Record<string, unknown> | null;
  approved_language: string[] | null;
  legal_claims: string[] | null;
  channel_voice_notes: Record<string, unknown> | null;
  section_status: SectionStatus | null;
  last_updated: string | null;
}

export interface MessageMatrix {
  id: string;
  client_id: string;
  label: string | null;
  dimension: MessageDimension | null;
  core_message: string | null;
  pain_point_addressed: string | null;
  proof_point: string | null;
  cta: string | null;
  objections_response: Record<string, unknown> | null;
  sample_language: string | null;
  section_status: SectionStatus | null;
  approved_by: string | null;
  approval_date: string | null;
  next_review_date: string | null;
  performance_notes: string | null;
  message_version: number;
  last_updated: string | null;
}

export interface MessagePersonaLink {
  message_id: string;
  persona_id: string;
}

export interface MessageICPLink {
  message_id: string;
  icp_id: string;
}

export interface ContentIndex {
  id: string;
  client_id: string;
  title: string | null;
  format: ContentFormat | null;
  url: string | null;
  date_published: string | null;
  channel: string | null;
  performance_category: PerformanceCategory | null;
  performance_notes: string | null;
  is_proof_point: boolean | null;
  proof_point_type: string | null;
  proof_point_summary: string | null;
  repurpose_potential: string | null;
  owner: string | null;
  status: string | null;
  last_updated: string | null;
}

export interface ContentPersonaLink {
  content_id: string;
  persona_id: string;
}

export interface ContentICPLink {
  content_id: string;
  icp_id: string;
}

export interface ContentMessageLink {
  content_id: string;
  message_id: string;
}

export interface CampaignHistory {
  id: string;
  client_id: string;
  name: string | null;
  status: CampaignStatus | null;
  channels: string[] | null;
  start_date: string | null;
  end_date: string | null;
  goal: string | null;
  result: string | null;
  worked: string | null;
  key_metrics: Record<string, unknown> | null;
  lessons_learned: string | null;
  message_version_at_launch: number | null;
  messaging_current: boolean | null;
  performance_snapshot: Record<string, unknown> | null;
  last_updated: string | null;
}

export interface CampaignMessageLink {
  campaign_id: string;
  message_id: string;
}

export interface HubSpotHealth {
  client_id: string;
  portal_id: string | null;
  hubspot_tier: string | null;
  last_data_hygiene: string | null;
  contact_db_stats: Record<string, unknown> | null;
  pipeline_config: Record<string, unknown> | null;
  automation_status: Record<string, unknown> | null;
  lc_custom_properties: Record<string, unknown> | null;
  integrations: Record<string, unknown> | null;
  known_issues: Record<string, unknown> | null;
  section_status: SectionStatus | null;
  last_updated: string | null;
}

export interface ReviewRules {
  client_id: string;
  auto_execute_rules: string[] | null;
  lc_review_rules: string[] | null;
  client_signoff_rules: string[] | null;
  custom_rules: Record<string, unknown> | null;
  section_status: SectionStatus | null;
  last_updated: string | null;
}

export interface KeyContact {
  id: string;
  client_id: string;
  side: string | null;
  name: string | null;
  title: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
  communication_prefs: Record<string, unknown> | null;
  personality_notes: string | null;
  last_updated: string | null;
}

export interface GoalsBackwardsMath {
  id: string;
  client_id: string;
  period: string | null;
  revenue_target: number | null;
  avg_deal_size: number | null;
  win_rate: number | null;
  required_pipeline: number | null;
  required_sqls: number | null;
  sql_conversion_rate: number | null;
  required_mqls: number | null;
  mql_conversion_rate: number | null;
  required_top_of_funnel: number | null;
  monthly_mql_target: number | null;
  current_pipeline: number | null;
  current_mqls: number | null;
  on_track: GoalStatus | null;
  goal_notes: string | null;
  last_updated: string | null;
}

export interface SOWScope {
  client_id: string;
  contract_start: string | null;
  contract_end: string | null;
  monthly_retainer: number | null;
  billing_cycle: string | null;
  status: ContractStatus | null;
  services_in_scope: Record<string, unknown> | null;
  deliverables: Record<string, unknown> | null;
  out_of_scope: string[] | null;
  escalation_path: string | null;
  renewal_notes: string | null;
  discrepancies: string | null;
  last_updated: string | null;
}

export interface LCEdgeBenchmarks {
  client_id: string;
  email_benchmarks: Record<string, unknown> | null;
  linkedin_benchmarks: Record<string, unknown> | null;
  paid_media_benchmarks: Record<string, unknown> | null;
  sales_benchmarks: Record<string, unknown> | null;
  share_of_voice: Record<string, unknown> | null;
  last_updated: string | null;
}

export interface IntegrationKey {
  id: string;
  client_id: string;
  service_name: string;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BrainChangeLog {
  id: string;
  client_id: string;
  object_type: string;
  object_id: string;
  field_changed: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  source: string | null;
  created_at: string;
}

export interface ActivityFeed {
  id: string;
  client_id: string;
  actor_id: string | null;
  action: string;
  object_type: string | null;
  object_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
