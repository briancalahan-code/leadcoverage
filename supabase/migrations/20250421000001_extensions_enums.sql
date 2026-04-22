-- Extensions
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Enums
create type account_health as enum ('green', 'yellow', 'red');
create type section_status as enum ('draft', 'lc_reviewed', 'client_approved', 'needs_refresh');
create type watch_priority as enum ('watch_closely', 'monitor', 'low_priority');
create type funding_type as enum ('bootstrapped', 'pe_backed', 'vc_backed', 'public');
create type company_size as enum ('1-50', '51-200', '201-500', '501-1000', '1000+');
create type persona_priority as enum ('primary', 'secondary', 'tertiary');
create type buying_role as enum ('economic_buyer', 'influencer', 'champion', 'blocker', 'end_user');
create type message_dimension as enum ('persona', 'market_condition', 'icp');
create type campaign_status as enum ('active', 'completed', 'paused', 'cancelled');
create type content_format as enum (
  'blog', 'case_study', 'white_paper', 'video', 'webinar', 'infographic',
  'email', 'social_post', 'press_release', 'analyst_report', 'index',
  'podcast', 'speaking_engagement'
);
create type performance_category as enum ('best_performing', 'solid', 'underperformed', 'content_graveyard');
create type goal_status as enum ('green', 'yellow', 'red');
create type contract_status as enum ('active', 'paused', 'churned', 'upsell');
create type pipeline_stage as enum ('stage_1', 'stage_2', 'stage_3', 'stage_4', 'stage_5', 'stage_6', 'stage_7');
create type user_role as enum ('admin', 'strategist', 'sdr', 'demand_gen', 'viewer');
