import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getBrainObject } from "@/lib/brain-objects";

type Params = { params: Promise<{ id: string; object: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id, object } = await params;
  const meta = getBrainObject(object);
  if (!meta)
    return NextResponse.json(
      { error: "Invalid brain object" },
      { status: 400 },
    );

  const supabase = await createClient();

  if (meta.singleton) {
    const { data, error } = await supabase
      .from(meta.table)
      .select("*")
      .eq("client_id", id)
      .maybeSingle();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from(meta.table)
    .select("*")
    .eq("client_id", id)
    .order("last_updated", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id, object } = await params;
  const meta = getBrainObject(object);
  if (!meta)
    return NextResponse.json(
      { error: "Invalid brain object" },
      { status: 400 },
    );

  const supabase = await createClient();
  const body = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (meta.singleton) {
    const { data, error } = await supabase
      .from(meta.table)
      .upsert({
        ...body,
        client_id: id,
        last_updated: new Date().toISOString(),
      })
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    // Write change log
    try {
      await supabase.from("brain_change_log").insert({
        client_id: id,
        object_type: object,
        object_id: id,
        field_changed: "all",
        old_value: null,
        new_value: JSON.stringify(data),
        changed_by: user?.id ?? null,
        source: "ui",
      });
    } catch {
      // Don't break main operation
    }

    return NextResponse.json(data, { status: 201 });
  }

  const { data, error } = await supabase
    .from(meta.table)
    .insert({ ...body, client_id: id, last_updated: new Date().toISOString() })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Write change log
  try {
    await supabase.from("brain_change_log").insert({
      client_id: id,
      object_type: object,
      object_id: data.id,
      field_changed: "all",
      old_value: null,
      new_value: JSON.stringify(data),
      changed_by: user?.id ?? null,
      source: "ui",
    });
  } catch {
    // Don't break main operation
  }

  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id, object } = await params;
  const meta = getBrainObject(object);
  if (!meta)
    return NextResponse.json(
      { error: "Invalid brain object" },
      { status: 400 },
    );

  const supabase = await createClient();
  const body = await request.json();
  const { record_id, ...fields } = body;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const changedFields = Object.keys(fields)
    .filter((k) => k !== "last_updated")
    .join(", ");

  if (meta.singleton) {
    const { data, error } = await supabase
      .from(meta.table)
      .update({ ...fields, last_updated: new Date().toISOString() })
      .eq("client_id", id)
      .select()
      .single();
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    // Write change log
    try {
      await supabase.from("brain_change_log").insert({
        client_id: id,
        object_type: object,
        object_id: id,
        field_changed: changedFields || "unknown",
        old_value: null,
        new_value: JSON.stringify(fields),
        changed_by: user?.id ?? null,
        source: "ui",
      });
    } catch {
      // Don't break main operation
    }

    return NextResponse.json(data);
  }

  if (!record_id)
    return NextResponse.json(
      { error: "record_id required for collection objects" },
      { status: 400 },
    );
  const { data, error } = await supabase
    .from(meta.table)
    .update({ ...fields, last_updated: new Date().toISOString() })
    .eq("id", record_id)
    .eq("client_id", id)
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Write change log
  try {
    await supabase.from("brain_change_log").insert({
      client_id: id,
      object_type: object,
      object_id: record_id,
      field_changed: changedFields || "unknown",
      old_value: null,
      new_value: JSON.stringify(fields),
      changed_by: user?.id ?? null,
      source: "ui",
    });
  } catch {
    // Don't break main operation
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id, object } = await params;
  const meta = getBrainObject(object);
  if (!meta)
    return NextResponse.json(
      { error: "Invalid brain object" },
      { status: 400 },
    );

  if (meta.singleton) {
    return NextResponse.json(
      { error: "Cannot delete singleton objects" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { record_id } = await request.json();
  if (!record_id)
    return NextResponse.json({ error: "record_id required" }, { status: 400 });

  const { error } = await supabase
    .from(meta.table)
    .delete()
    .eq("id", record_id)
    .eq("client_id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
