create table integration_keys (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  service_name text not null,
  encrypted_key text,
  encrypted_secret text,
  metadata jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_integration_keys_client on integration_keys(client_id);
create unique index idx_integration_keys_unique on integration_keys(client_id, service_name) where is_active = true;

alter table integration_keys enable row level security;

-- Helper functions for encryption/decryption using pgcrypto
create or replace function encrypt_api_key(plain_key text, passphrase text)
returns text as $$
  select encode(extensions.pgp_sym_encrypt(plain_key, passphrase), 'base64');
$$ language sql security definer;

create or replace function decrypt_api_key(encrypted_key text, passphrase text)
returns text as $$
  select extensions.pgp_sym_decrypt(decode(encrypted_key, 'base64'), passphrase);
$$ language sql security definer;
