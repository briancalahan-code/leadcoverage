create type job_status as enum ('pending', 'running', 'completed', 'failed');
create type job_type as enum ('personalization', 'report_generation', 'hubspot_sync', 'brain_populate');

create table jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  org_id uuid not null,
  job_type job_type not null,
  status job_status not null default 'pending',
  progress int not null default 0 check (progress >= 0 and progress <= 100),
  config jsonb default '{}',
  result jsonb,
  error text,
  created_by uuid,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

create index idx_jobs_client on jobs(client_id);
create index idx_jobs_status on jobs(status) where status in ('pending', 'running');
alter table jobs enable row level security;

create policy "org members can view jobs" on jobs
  for select using (org_id = (auth.jwt() ->> 'org_id')::uuid);

create policy "org members can create jobs" on jobs
  for insert with check (org_id = (auth.jwt() ->> 'org_id')::uuid);

create table job_schedules (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  org_id uuid not null,
  job_type job_type not null,
  cadence text not null check (cadence in ('weekly', 'biweekly', 'monthly')),
  config jsonb default '{}',
  next_run_at timestamptz,
  last_run_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table job_schedules enable row level security;

create policy "org members can manage schedules" on job_schedules
  for all using (org_id = (auth.jwt() ->> 'org_id')::uuid);
