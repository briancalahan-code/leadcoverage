-- Seed: Organization
INSERT INTO organizations (id, name, slug)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'LeadCoverage',
  'leadcoverage'
);

-- Seed: Test clients
INSERT INTO clients (id, org_id, name, website, pipeline_stage, account_health)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Acme Logistics', 'https://acmelogistics.com', 'stage_3', 'green'),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'FastFreight Inc', 'https://fastfreight.com', 'stage_1', 'yellow'),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Harbor Supply Chain', 'https://harborsupplychain.com', 'stage_5', 'green');

-- Seed: Company Intelligence for Acme
INSERT INTO company_intelligence (client_id, what_they_sell, who_they_sell_to, why_they_win, why_they_lose, business_goal, gtm_challenge, section_status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'End-to-end freight brokerage platform with real-time tracking',
  'Mid-market shippers (500-5000 employees) in manufacturing and retail',
  'Superior technology integration and 99.5% on-time delivery rate',
  'Price-sensitive deals against legacy brokers with established relationships',
  'Grow revenue 40% YoY by expanding into cold chain logistics',
  'Low brand awareness outside core Midwest market',
  'lc_reviewed'
);

-- Seed: ICP Definitions for Acme
INSERT INTO icp_definitions (id, client_id, name, company_size_range, industry_vertical, geography, priority, section_status)
VALUES
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Mid-Market Manufacturer', '201-500', ARRAY['Manufacturing', 'Industrial'], ARRAY['Midwest', 'Southeast'], 'primary', 'draft'),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Retail Distributor', '501-1000', ARRAY['Retail', 'E-commerce'], ARRAY['National'], 'secondary', 'draft');

-- Seed: Personas for Acme
INSERT INTO personas (id, client_id, name, title_variants, priority, buying_role, pain_points, section_status)
VALUES
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'VP of Supply Chain', ARRAY['VP Supply Chain', 'VP Logistics', 'SVP Operations'], 'primary', 'economic_buyer', ARRAY['Lack of shipment visibility', 'Manual carrier management', 'Rising freight costs'], 'draft'),
  (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'Logistics Manager', ARRAY['Logistics Manager', 'Transportation Manager', 'Shipping Manager'], 'secondary', 'champion', ARRAY['Too many spreadsheets', 'Carrier communication gaps', 'Load planning inefficiency'], 'draft');

-- Seed: Voice Model for Acme
INSERT INTO voice_model (client_id, founder_name, brand_tone_summary, communication_style, phrases_they_use, phrases_they_avoid, section_status)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Mike Chen',
  'Confident, data-driven, straightforward. No fluff.',
  'Direct and technical. Backs claims with numbers.',
  ARRAY['supply chain visibility', 'real-time tracking', 'data-driven decisions', 'freight intelligence'],
  ARRAY['synergy', 'leverage', 'circle back', 'move the needle'],
  'draft'
);

-- JWT Custom Claims Hook
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_org_id uuid;
BEGIN
  SELECT role, org_id INTO user_role, user_org_id
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{org_id}', to_jsonb(user_org_id));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
