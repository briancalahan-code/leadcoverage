-- Add slug column to clients for portal URLs
alter table clients add column slug text unique;
create index idx_clients_slug on clients(slug);
