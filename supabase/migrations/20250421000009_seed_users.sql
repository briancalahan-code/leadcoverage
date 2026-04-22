-- Seed: Test users (matches auth.users created via Admin API)
INSERT INTO users (id, org_id, email, full_name, role) VALUES
  ('94df4b4d-0da7-4a6a-9324-4be4f97d2572', 'a0000000-0000-0000-0000-000000000001', 'admin@leadcoverage.com', 'Admin User', 'admin'),
  ('449e8526-04e3-4e25-84e5-8322493c6048', 'a0000000-0000-0000-0000-000000000001', 'contributor@leadcoverage.com', 'Contributor User', 'strategist'),
  ('0217d331-ccf0-49ea-8be1-e78e834c5a42', 'a0000000-0000-0000-0000-000000000001', 'viewer@leadcoverage.com', 'Viewer User', 'viewer');
