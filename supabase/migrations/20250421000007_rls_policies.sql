-- Helper: get user's org_id
create or replace function get_user_org_id()
returns uuid as $$
  select org_id from users where id = auth.uid();
$$ language sql security definer stable;

-- Helper: check if user is admin
create or replace function is_org_admin()
returns boolean as $$
  select exists(select 1 from users where id = auth.uid() and role = 'admin');
$$ language sql security definer stable;

-- Organizations: users see their own org
create policy "users see own org" on organizations
  for select using (id = get_user_org_id());

-- Users: see own org members
create policy "users see own org members" on users
  for select using (org_id = get_user_org_id());

create policy "admins manage org users" on users
  for all using (org_id = get_user_org_id() and is_org_admin());

-- Clients: scoped to org
create policy "org members see clients" on clients
  for select using (org_id = get_user_org_id());

create policy "org members insert clients" on clients
  for insert with check (org_id = get_user_org_id());

create policy "org members update clients" on clients
  for update using (org_id = get_user_org_id());

create policy "admins delete clients" on clients
  for delete using (org_id = get_user_org_id() and is_org_admin());

-- Macro for brain object RLS (all brain tables use client_id → clients.org_id)
-- Each brain object table gets SELECT/INSERT/UPDATE/DELETE scoped through client's org

-- Company Intelligence
create policy "org access" on company_intelligence for select using (
  exists(select 1 from clients where clients.id = company_intelligence.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on company_intelligence for insert with check (
  exists(select 1 from clients where clients.id = company_intelligence.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on company_intelligence for update using (
  exists(select 1 from clients where clients.id = company_intelligence.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on company_intelligence for delete using (
  exists(select 1 from clients where clients.id = company_intelligence.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- ICP Definitions
create policy "org access" on icp_definitions for select using (
  exists(select 1 from clients where clients.id = icp_definitions.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on icp_definitions for insert with check (
  exists(select 1 from clients where clients.id = icp_definitions.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on icp_definitions for update using (
  exists(select 1 from clients where clients.id = icp_definitions.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on icp_definitions for delete using (
  exists(select 1 from clients where clients.id = icp_definitions.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Personas
create policy "org access" on personas for select using (
  exists(select 1 from clients where clients.id = personas.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on personas for insert with check (
  exists(select 1 from clients where clients.id = personas.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on personas for update using (
  exists(select 1 from clients where clients.id = personas.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on personas for delete using (
  exists(select 1 from clients where clients.id = personas.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Persona ICP Links (access via persona → client)
create policy "org access" on persona_icp_links for select using (
  exists(select 1 from personas join clients on clients.id = personas.client_id where personas.id = persona_icp_links.persona_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on persona_icp_links for insert with check (
  exists(select 1 from personas join clients on clients.id = personas.client_id where personas.id = persona_icp_links.persona_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on persona_icp_links for delete using (
  exists(select 1 from personas join clients on clients.id = personas.client_id where personas.id = persona_icp_links.persona_id and clients.org_id = get_user_org_id())
);

-- Competitive Map
create policy "org access" on competitive_map for select using (
  exists(select 1 from clients where clients.id = competitive_map.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on competitive_map for insert with check (
  exists(select 1 from clients where clients.id = competitive_map.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on competitive_map for update using (
  exists(select 1 from clients where clients.id = competitive_map.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on competitive_map for delete using (
  exists(select 1 from clients where clients.id = competitive_map.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Voice Model
create policy "org access" on voice_model for select using (
  exists(select 1 from clients where clients.id = voice_model.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on voice_model for insert with check (
  exists(select 1 from clients where clients.id = voice_model.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on voice_model for update using (
  exists(select 1 from clients where clients.id = voice_model.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on voice_model for delete using (
  exists(select 1 from clients where clients.id = voice_model.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Message Matrix
create policy "org access" on message_matrix for select using (
  exists(select 1 from clients where clients.id = message_matrix.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on message_matrix for insert with check (
  exists(select 1 from clients where clients.id = message_matrix.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on message_matrix for update using (
  exists(select 1 from clients where clients.id = message_matrix.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on message_matrix for delete using (
  exists(select 1 from clients where clients.id = message_matrix.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Message Persona Links
create policy "org access" on message_persona_links for select using (
  exists(select 1 from message_matrix join clients on clients.id = message_matrix.client_id where message_matrix.id = message_persona_links.message_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on message_persona_links for insert with check (
  exists(select 1 from message_matrix join clients on clients.id = message_matrix.client_id where message_matrix.id = message_persona_links.message_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on message_persona_links for delete using (
  exists(select 1 from message_matrix join clients on clients.id = message_matrix.client_id where message_matrix.id = message_persona_links.message_id and clients.org_id = get_user_org_id())
);

-- Message ICP Links
create policy "org access" on message_icp_links for select using (
  exists(select 1 from message_matrix join clients on clients.id = message_matrix.client_id where message_matrix.id = message_icp_links.message_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on message_icp_links for insert with check (
  exists(select 1 from message_matrix join clients on clients.id = message_matrix.client_id where message_matrix.id = message_icp_links.message_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on message_icp_links for delete using (
  exists(select 1 from message_matrix join clients on clients.id = message_matrix.client_id where message_matrix.id = message_icp_links.message_id and clients.org_id = get_user_org_id())
);

-- Content Index
create policy "org access" on content_index for select using (
  exists(select 1 from clients where clients.id = content_index.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on content_index for insert with check (
  exists(select 1 from clients where clients.id = content_index.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on content_index for update using (
  exists(select 1 from clients where clients.id = content_index.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on content_index for delete using (
  exists(select 1 from clients where clients.id = content_index.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Content link tables
create policy "org access" on content_persona_links for select using (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_persona_links.content_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on content_persona_links for insert with check (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_persona_links.content_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on content_persona_links for delete using (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_persona_links.content_id and clients.org_id = get_user_org_id())
);

create policy "org access" on content_icp_links for select using (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_icp_links.content_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on content_icp_links for insert with check (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_icp_links.content_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on content_icp_links for delete using (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_icp_links.content_id and clients.org_id = get_user_org_id())
);

create policy "org access" on content_message_links for select using (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_message_links.content_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on content_message_links for insert with check (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_message_links.content_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on content_message_links for delete using (
  exists(select 1 from content_index join clients on clients.id = content_index.client_id where content_index.id = content_message_links.content_id and clients.org_id = get_user_org_id())
);

-- Campaign History
create policy "org access" on campaign_history for select using (
  exists(select 1 from clients where clients.id = campaign_history.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on campaign_history for insert with check (
  exists(select 1 from clients where clients.id = campaign_history.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on campaign_history for update using (
  exists(select 1 from clients where clients.id = campaign_history.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on campaign_history for delete using (
  exists(select 1 from clients where clients.id = campaign_history.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Campaign Message Links
create policy "org access" on campaign_message_links for select using (
  exists(select 1 from campaign_history join clients on clients.id = campaign_history.client_id where campaign_history.id = campaign_message_links.campaign_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on campaign_message_links for insert with check (
  exists(select 1 from campaign_history join clients on clients.id = campaign_history.client_id where campaign_history.id = campaign_message_links.campaign_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on campaign_message_links for delete using (
  exists(select 1 from campaign_history join clients on clients.id = campaign_history.client_id where campaign_history.id = campaign_message_links.campaign_id and clients.org_id = get_user_org_id())
);

-- HubSpot Health
create policy "org access" on hubspot_health for select using (
  exists(select 1 from clients where clients.id = hubspot_health.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on hubspot_health for insert with check (
  exists(select 1 from clients where clients.id = hubspot_health.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on hubspot_health for update using (
  exists(select 1 from clients where clients.id = hubspot_health.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on hubspot_health for delete using (
  exists(select 1 from clients where clients.id = hubspot_health.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Review Rules
create policy "org access" on review_rules for select using (
  exists(select 1 from clients where clients.id = review_rules.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on review_rules for insert with check (
  exists(select 1 from clients where clients.id = review_rules.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on review_rules for update using (
  exists(select 1 from clients where clients.id = review_rules.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on review_rules for delete using (
  exists(select 1 from clients where clients.id = review_rules.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Key Contacts
create policy "org access" on key_contacts for select using (
  exists(select 1 from clients where clients.id = key_contacts.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on key_contacts for insert with check (
  exists(select 1 from clients where clients.id = key_contacts.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on key_contacts for update using (
  exists(select 1 from clients where clients.id = key_contacts.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on key_contacts for delete using (
  exists(select 1 from clients where clients.id = key_contacts.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Goals & Backwards Math
create policy "org access" on goals_backwards_math for select using (
  exists(select 1 from clients where clients.id = goals_backwards_math.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on goals_backwards_math for insert with check (
  exists(select 1 from clients where clients.id = goals_backwards_math.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on goals_backwards_math for update using (
  exists(select 1 from clients where clients.id = goals_backwards_math.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on goals_backwards_math for delete using (
  exists(select 1 from clients where clients.id = goals_backwards_math.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- SOW & Scope
create policy "org access" on sow_scope for select using (
  exists(select 1 from clients where clients.id = sow_scope.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on sow_scope for insert with check (
  exists(select 1 from clients where clients.id = sow_scope.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on sow_scope for update using (
  exists(select 1 from clients where clients.id = sow_scope.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on sow_scope for delete using (
  exists(select 1 from clients where clients.id = sow_scope.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- LC Edge Benchmarks
create policy "org access" on lc_edge_benchmarks for select using (
  exists(select 1 from clients where clients.id = lc_edge_benchmarks.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on lc_edge_benchmarks for insert with check (
  exists(select 1 from clients where clients.id = lc_edge_benchmarks.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on lc_edge_benchmarks for update using (
  exists(select 1 from clients where clients.id = lc_edge_benchmarks.client_id and clients.org_id = get_user_org_id())
);
create policy "org delete" on lc_edge_benchmarks for delete using (
  exists(select 1 from clients where clients.id = lc_edge_benchmarks.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Integration Keys (access via client org)
create policy "org access" on integration_keys for select using (
  exists(select 1 from clients where clients.id = integration_keys.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on integration_keys for insert with check (
  exists(select 1 from clients where clients.id = integration_keys.client_id and clients.org_id = get_user_org_id())
);
create policy "org update" on integration_keys for update using (
  exists(select 1 from clients where clients.id = integration_keys.client_id and clients.org_id = get_user_org_id())
);
create policy "admin delete" on integration_keys for delete using (
  exists(select 1 from clients where clients.id = integration_keys.client_id and clients.org_id = get_user_org_id()) and is_org_admin()
);

-- Change Log & Activity Feed
create policy "org access" on brain_change_log for select using (
  exists(select 1 from clients where clients.id = brain_change_log.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on brain_change_log for insert with check (
  exists(select 1 from clients where clients.id = brain_change_log.client_id and clients.org_id = get_user_org_id())
);

create policy "org access" on activity_feed for select using (
  exists(select 1 from clients where clients.id = activity_feed.client_id and clients.org_id = get_user_org_id())
);
create policy "org insert" on activity_feed for insert with check (
  exists(select 1 from clients where clients.id = activity_feed.client_id and clients.org_id = get_user_org_id())
);
