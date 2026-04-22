create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key references auth.users on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role user_role not null default 'viewer',
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create index idx_users_org_id on users(org_id);

alter table organizations enable row level security;
alter table users enable row level security;
