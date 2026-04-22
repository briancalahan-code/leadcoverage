import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const VALID_OBJECTS = [
  "company_intelligence",
  "icp_definitions",
  "personas",
  "competitive_map",
  "voice_model",
  "message_matrix",
  "content_index",
  "campaign_history",
  "hubspot_health",
  "review_rules",
  "key_contacts",
  "goals_backwards_math",
  "sow_scope",
  "lc_edge_benchmarks",
];

const SINGLETON_OBJECTS = [
  "company_intelligence",
  "voice_model",
  "hubspot_health",
  "review_rules",
  "sow_scope",
  "lc_edge_benchmarks",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; object: string }> },
) {
  const { id, object } = await params;
  if (!VALID_OBJECTS.includes(object))
    return NextResponse.json(
      { error: "Invalid brain object" },
      { status: 400 },
    );

  const supabase = await createClient();

  if (SINGLETON_OBJECTS.includes(object)) {
    const { data, error } = await supabase
      .from(object)
      .select("*")
      .eq("client_id", id)
      .single();
    if (error && error.code !== "PGRST116")
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from(object)
    .select("*")
    .eq("client_id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; object: string }> },
) {
  const { id, object } = await params;
  if (!VALID_OBJECTS.includes(object))
    return NextResponse.json(
      { error: "Invalid brain object" },
      { status: 400 },
    );

  const supabase = await createClient();
  const body = await request.json();

  if (SINGLETON_OBJECTS.includes(object)) {
    const { data, error } = await supabase
      .from(object)
      .upsert({ ...body, client_id: id })
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from(object)
    .insert({ ...body, client_id: id })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; object: string }> },
) {
  const { id, object } = await params;
  if (!VALID_OBJECTS.includes(object))
    return NextResponse.json(
      { error: "Invalid brain object" },
      { status: 400 },
    );

  const supabase = await createClient();
  const body = await request.json();
  const { record_id, ...updates } = body;

  if (SINGLETON_OBJECTS.includes(object)) {
    const { data, error } = await supabase
      .from(object)
      .update(updates)
      .eq("client_id", id)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  if (!record_id)
    return NextResponse.json(
      { error: "record_id required for collection objects" },
      { status: 400 },
    );
  const { data, error } = await supabase
    .from(object)
    .update(updates)
    .eq("id", record_id)
    .eq("client_id", id)
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
