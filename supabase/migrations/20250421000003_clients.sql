create table clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  website text,
  pipeline_stage pipeline_stage default 'stage_1',
  account_health account_health default 'green',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clients_org_id on clients(org_id);

alter table clients enable row level security;
