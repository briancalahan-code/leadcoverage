import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { BRAIN_OBJECTS } from "@/lib/brain-objects";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();

  // Verify auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: {
    type: "client" | "brain_object";
    label: string;
    href: string;
  }[] = [];

  // Search clients by name
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .ilike("name", `%${q}%`)
    .limit(10);

  if (clients) {
    for (const client of clients) {
      results.push({
        type: "client",
        label: client.name,
        href: `/clients/${client.id}`,
      });
    }
  }

  // Search brain object labels (static match)
  const lowerQ = q.toLowerCase();
  for (const obj of BRAIN_OBJECTS) {
    if (obj.label.toLowerCase().includes(lowerQ)) {
      results.push({
        type: "brain_object",
        label: obj.label,
        href: `/clients?brain=${obj.key}`,
      });
    }
  }

  return NextResponse.json({ results });
}
