import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BRAIN_OBJECTS } from "@/lib/brain-objects";
import { BrainObjectCard } from "@/components/brain/brain-object-card";
import { BrainTierSection } from "@/components/brain/brain-tier-section";

export default async function BrainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", id)
    .single();
  if (!client) notFound();

  const brainData: Record<string, unknown> = {};
  await Promise.all(
    BRAIN_OBJECTS.map(async (obj) => {
      if (obj.singleton) {
        const { data } = await supabase
          .from(obj.table)
          .select("*")
          .eq("client_id", id)
          .maybeSingle();
        brainData[obj.key] = data;
      } else {
        const { data } = await supabase
          .from(obj.table)
          .select("*")
          .eq("client_id", id)
          .order("last_updated", { ascending: false });
        brainData[obj.key] = data || [];
      }
    }),
  );

  const tiers = {
    primary: BRAIN_OBJECTS.filter((o) => o.tier === "primary"),
    strategy: BRAIN_OBJECTS.filter((o) => o.tier === "strategy"),
    operations: BRAIN_OBJECTS.filter((o) => o.tier === "operations"),
    governance: BRAIN_OBJECTS.filter((o) => o.tier === "governance"),
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Client Brain</h2>
          <p className="text-sm text-gray-500">
            14 intelligence objects powering personalization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {tiers.primary.map((obj) => (
          <BrainObjectCard
            key={obj.key}
            meta={obj}
            clientId={id}
            data={brainData[obj.key] as any}
          />
        ))}
      </div>

      <BrainTierSection title="Strategy" defaultOpen>
        {tiers.strategy.map((obj) => (
          <BrainObjectCard
            key={obj.key}
            meta={obj}
            clientId={id}
            data={brainData[obj.key] as any}
          />
        ))}
      </BrainTierSection>

      <BrainTierSection title="Operations">
        {tiers.operations.map((obj) => (
          <BrainObjectCard
            key={obj.key}
            meta={obj}
            clientId={id}
            data={brainData[obj.key] as any}
          />
        ))}
      </BrainTierSection>

      <BrainTierSection title="Governance">
        {tiers.governance.map((obj) => (
          <BrainObjectCard
            key={obj.key}
            meta={obj}
            clientId={id}
            data={brainData[obj.key] as any}
          />
        ))}
      </BrainTierSection>
    </div>
  );
}
