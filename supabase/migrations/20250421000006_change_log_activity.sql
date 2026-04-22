create table brain_change_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  object_type text not null,
  object_id uuid not null,
  field_changed text,
  old_value text,
  new_value text,
  changed_by uuid references auth.users(id),
  source text,
  created_at timestamptz not null default now()
);

create index idx_change_log_client on brain_change_log(client_id);
create index idx_change_log_created on brain_change_log(created_at desc);

alter table brain_change_log enable row level security;

create table activity_feed (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  actor_id uuid references auth.users(id),
  action text not null,
  object_type text,
  object_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_activity_feed_client on activity_feed(client_id);
create index idx_activity_feed_created on activity_feed(created_at desc);

alter table activity_feed enable row level security;
