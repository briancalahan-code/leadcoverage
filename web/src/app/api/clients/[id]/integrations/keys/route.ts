import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Security: never return encrypted_key or encrypted_secret fields
const SAFE_COLUMNS = "id, service_name, is_active, created_at, updated_at";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_keys")
    .select(SAFE_COLUMNS)
    .eq("client_id", id)
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { service_name, api_key, secret } = body;

  if (!service_name || !api_key) {
    return NextResponse.json(
      { error: "service_name and api_key are required" },
      { status: 400 },
    );
  }

  // Forward to FastAPI for encryption and storage
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "API URL not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${apiUrl}/api/integrations/${id}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service_name, api_key, secret }),
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ detail: "Encryption service error" }));
      return NextResponse.json(
        { error: err.detail || "Failed to store key" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach encryption service" },
      { status: 502 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const keyId = request.nextUrl.searchParams.get("key_id");

  if (!keyId) {
    return NextResponse.json(
      { error: "key_id query parameter is required" },
      { status: 400 },
    );
  }

  // Forward to FastAPI for soft delete
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { error: "API URL not configured" },
      { status: 500 },
    );
  }

  try {
    const res = await fetch(`${apiUrl}/api/integrations/${id}/keys/${keyId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Service error" }));
      return NextResponse.json(
        { error: err.detail || "Failed to deactivate key" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to reach service" },
      { status: 502 },
    );
  }
}
