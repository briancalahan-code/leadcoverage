-- 1. Company Intelligence (singleton per client)
create table company_intelligence (
  client_id uuid primary key references clients(id) on delete cascade,
  what_they_sell text,
  who_they_sell_to text,
  why_they_win text,
  why_they_lose text,
  business_goal text,
  gtm_challenge text,
  product_overview text,
  sales_handoff_notes jsonb,
  seasonal_intelligence jsonb,
  win_loss_log jsonb,
  icp_validation_notes jsonb,
  section_status section_status default 'draft',
  last_updated timestamptz default now()
);
alter table company_intelligence enable row level security;

-- 2. ICP Definitions (collection)
create table icp_definitions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  company_size_range company_size,
  industry_vertical text[],
  geography text[],
  funding_type funding_type,
  tech_stack_signals text[],
  buying_triggers jsonb,
  deal_size_range text,
  avg_sales_cycle text,
  disqualifiers text[],
  priority persona_priority,
  tam_estimate text,
  customer_list_loaded boolean default false,
  section_status section_status default 'draft',
  last_updated timestamptz default now()
);
create index idx_icp_definitions_client on icp_definitions(client_id);
alter table icp_definitions enable row level security;

-- 3. Personas (collection)
create table personas (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  title_variants text[],
  priority persona_priority,
  buying_role buying_role,
  pain_points text[],
  "values" text[],
  research_channels text[],
  contact_preference text,
  communication_style text,
  section_status section_status default 'draft',
  last_updated timestamptz default now()
);
create index idx_personas_client on personas(client_id);
alter table personas enable row level security;

-- Persona ↔ ICP link
create table persona_icp_links (
  persona_id uuid not null references personas(id) on delete cascade,
  icp_id uuid not null references icp_definitions(id) on delete cascade,
  primary key (persona_id, icp_id)
);
alter table persona_icp_links enable row level security;

-- 4. Competitive Map (collection)
create table competitive_map (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  competitor_name text not null,
  positioning text,
  strengths text,
  weaknesses text,
  recent_moves text,
  differentiators text,
  win_loss_summary text,
  objections jsonb,
  watch_priority watch_priority default 'monitor',
  section_status section_status default 'draft',
  approved_by text,
  approval_date timestamptz,
  last_updated timestamptz default now()
);
create index idx_competitive_map_client on competitive_map(client_id);
alter table competitive_map enable row level security;

-- 5. Voice Model (singleton per client)
create table voice_model (
  client_id uuid primary key references clients(id) on delete cascade,
  founder_name text,
  founder_linkedin text,
  brand_tone_summary text,
  communication_style text,
  credible_topics text[],
  avoid_topics text[],
  phrases_they_use text[],
  phrases_they_avoid text[],
  sample_content_good jsonb,
  sample_content_bad jsonb,
  approved_language text[],
  legal_claims text[],
  channel_voice_notes jsonb,
  section_status section_status default 'draft',
  last_updated timestamptz default now()
);
alter table voice_model enable row level security;

-- 6. Message Matrix (collection)
create table message_matrix (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  label text,
  dimension message_dimension,
  core_message text,
  pain_point_addressed text,
  proof_point text,
  cta text,
  objections_response jsonb,
  sample_language text,
  section_status section_status default 'draft',
  approved_by text,
  approval_date timestamptz,
  next_review_date date,
  performance_notes text,
  message_version int not null default 1,
  last_updated timestamptz default now()
);
create index idx_message_matrix_client on message_matrix(client_id);
alter table message_matrix enable row level security;

-- Message ↔ Persona link
create table message_persona_links (
  message_id uuid not null references message_matrix(id) on delete cascade,
  persona_id uuid not null references personas(id) on delete cascade,
  primary key (message_id, persona_id)
);
alter table message_persona_links enable row level security;

-- Message ↔ ICP link
create table message_icp_links (
  message_id uuid not null references message_matrix(id) on delete cascade,
  icp_id uuid not null references icp_definitions(id) on delete cascade,
  primary key (message_id, icp_id)
);
alter table message_icp_links enable row level security;

-- 7. Content Index (collection)
create table content_index (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  title text,
  format content_format,
  url text,
  date_published date,
  channel text,
  performance_category performance_category,
  performance_notes text,
  is_proof_point boolean default false,
  proof_point_type text,
  proof_point_summary text,
  repurpose_potential text,
  owner text,
  status text,
  last_updated timestamptz default now()
);
create index idx_content_index_client on content_index(client_id);
alter table content_index enable row level security;

-- Content ↔ Persona link
create table content_persona_links (
  content_id uuid not null references content_index(id) on delete cascade,
  persona_id uuid not null references personas(id) on delete cascade,
  primary key (content_id, persona_id)
);
alter table content_persona_links enable row level security;

-- Content ↔ ICP link
create table content_icp_links (
  content_id uuid not null references content_index(id) on delete cascade,
  icp_id uuid not null references icp_definitions(id) on delete cascade,
  primary key (content_id, icp_id)
);
alter table content_icp_links enable row level security;

-- Content ↔ Message link
create table content_message_links (
  content_id uuid not null references content_index(id) on delete cascade,
  message_id uuid not null references message_matrix(id) on delete cascade,
  primary key (content_id, message_id)
);
alter table content_message_links enable row level security;

-- 8. Campaign History (collection)
create table campaign_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text,
  status campaign_status default 'active',
  channels text[],
  start_date date,
  end_date date,
  goal text,
  result text,
  worked text,
  key_metrics jsonb,
  lessons_learned text,
  message_version_at_launch int,
  messaging_current boolean default true,
  performance_snapshot jsonb,
  last_updated timestamptz default now()
);
create index idx_campaign_history_client on campaign_history(client_id);
alter table campaign_history enable row level security;

-- Campaign ↔ Message link
create table campaign_message_links (
  campaign_id uuid not null references campaign_history(id) on delete cascade,
  message_id uuid not null references message_matrix(id) on delete cascade,
  primary key (campaign_id, message_id)
);
alter table campaign_message_links enable row level security;

-- 9. HubSpot Health (singleton per client)
create table hubspot_health (
  client_id uuid primary key references clients(id) on delete cascade,
  portal_id text,
  hubspot_tier text,
  last_data_hygiene date,
  contact_db_stats jsonb,
  pipeline_config jsonb,
  automation_status jsonb,
  lc_custom_properties jsonb,
  integrations jsonb,
  known_issues jsonb,
  section_status section_status default 'draft',
  last_updated timestamptz default now()
);
alter table hubspot_health enable row level security;

-- 10. Review Rules (singleton per client)
create table review_rules (
  client_id uuid primary key references clients(id) on delete cascade,
  auto_execute_rules text[],
  lc_review_rules text[],
  client_signoff_rules text[],
  custom_rules jsonb,
  section_status section_status default 'draft',
  last_updated timestamptz default now()
);
alter table review_rules enable row level security;

-- 11. Key Contacts (collection)
create table key_contacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  side text,
  name text,
  title text,
  role text,
  email text,
  phone text,
  is_primary boolean default false,
  communication_prefs jsonb,
  personality_notes text,
  last_updated timestamptz default now()
);
create index idx_key_contacts_client on key_contacts(client_id);
alter table key_contacts enable row level security;

-- 12. Goals & Backwards Math (collection)
create table goals_backwards_math (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  period text,
  revenue_target numeric,
  avg_deal_size numeric,
  win_rate numeric,
  required_pipeline numeric,
  required_sqls int,
  sql_conversion_rate numeric,
  required_mqls int,
  mql_conversion_rate numeric,
  required_top_of_funnel int,
  monthly_mql_target int,
  current_pipeline numeric,
  current_mqls int,
  on_track goal_status,
  goal_notes text,
  last_updated timestamptz default now()
);
create index idx_goals_client on goals_backwards_math(client_id);
alter table goals_backwards_math enable row level security;

-- 13. SOW & Scope (singleton per client)
create table sow_scope (
  client_id uuid primary key references clients(id) on delete cascade,
  contract_start date,
  contract_end date,
  monthly_retainer numeric,
  billing_cycle text,
  status contract_status default 'active',
  services_in_scope jsonb,
  deliverables jsonb,
  out_of_scope text[],
  escalation_path text,
  renewal_notes text,
  discrepancies text,
  last_updated timestamptz default now()
);
alter table sow_scope enable row level security;

-- 14. LC Edge Benchmarks (singleton per client)
create table lc_edge_benchmarks (
  client_id uuid primary key references clients(id) on delete cascade,
  email_benchmarks jsonb,
  linkedin_benchmarks jsonb,
  paid_media_benchmarks jsonb,
  sales_benchmarks jsonb,
  share_of_voice jsonb,
  last_updated timestamptz default now()
);
alter table lc_edge_benchmarks enable row level security;
