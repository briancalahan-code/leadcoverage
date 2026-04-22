-- Reports: generated_reports + reporting schema aggregates & benchmarks

create table generated_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  org_id uuid not null,
  report_type text not null default 'stage_7_review',
  title text,
  period text,
  content jsonb not null default '{}',
  narrative text,
  dimensions jsonb default '{}',
  created_by uuid,
  created_at timestamptz default now()
);

create index idx_reports_client on generated_reports(client_id);
alter table generated_reports enable row level security;

create policy "org members can view reports" on generated_reports
  for select using (org_id = (auth.jwt() ->> 'org_id')::uuid);

create policy "org members can create reports" on generated_reports
  for insert with check (org_id = (auth.jwt() ->> 'org_id')::uuid);

create schema if not exists reporting;

create table reporting.lc_edge_aggregates (
  id uuid primary key default gen_random_uuid(),
  metric_type text not null,
  metric_name text not null,
  metric_value numeric,
  sample_size int,
  period text,
  computed_at timestamptz default now()
);

create table reporting.benchmark_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  snapshot_date date not null,
  metrics jsonb not null,
  created_at timestamptz default now()
);
