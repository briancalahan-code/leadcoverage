import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const clientId = request.nextUrl.searchParams.get("client_id");

  if (!clientId) {
    return NextResponse.json(
      { error: "client_id query param is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("job_schedules")
    .select("*")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up org_id from user's profile
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 404 },
    );
  }

  // If an id is provided, update existing schedule
  if (body.id) {
    const { data, error } = await supabase
      .from("job_schedules")
      .update({
        cadence: body.cadence,
        config: body.config ?? {},
        next_run_at: body.next_run_at,
        is_active: true,
      })
      .eq("id", body.id)
      .eq("org_id", profile.org_id)
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  // Create new schedule
  const { data, error } = await supabase
    .from("job_schedules")
    .insert({
      client_id: body.client_id,
      job_type: body.job_type,
      cadence: body.cadence,
      config: body.config ?? {},
      next_run_at: body.next_run_at,
      org_id: profile.org_id,
      is_active: true,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const scheduleId = request.nextUrl.searchParams.get("id");

  if (!scheduleId) {
    return NextResponse.json(
      { error: "id query param is required" },
      { status: 400 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up org_id from user's profile
  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "User profile not found" },
      { status: 404 },
    );
  }

  // Soft-delete: set is_active = false
  const { data, error } = await supabase
    .from("job_schedules")
    .update({ is_active: false })
    .eq("id", scheduleId)
    .eq("org_id", profile.org_id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
