import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

const STAGES = [
  { key: "stage_1", label: "Stage 1", description: "Onboarding & Discovery" },
  { key: "stage_2", label: "Stage 2", description: "Brain Population" },
  { key: "stage_3", label: "Stage 3", description: "Strategy Development" },
  { key: "stage_4", label: "Stage 4", description: "Content & Campaign Build" },
  { key: "stage_5", label: "Stage 5", description: "Launch & Execution" },
  { key: "stage_6", label: "Stage 6", description: "Optimization & Reporting" },
  { key: "stage_7", label: "Stage 7", description: "Review & Renewal" },
];

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, pipeline_stage")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const currentIndex = STAGES.findIndex((s) => s.key === client.pipeline_stage);

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href={`/clients/${id}`}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          &larr; {client.name}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
      </div>
      <div className="space-y-3">
        {STAGES.map((stage, i) => (
          <div
            key={stage.key}
            className={`bg-white rounded-lg border p-4 flex items-center gap-4 ${i === currentIndex ? "border-blue-500 ring-1 ring-blue-500" : ""} ${i < currentIndex ? "opacity-60" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < currentIndex ? "bg-green-100 text-green-700" : i === currentIndex ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-400"}`}
            >
              {i < currentIndex ? "✓" : i + 1}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{stage.label}</h3>
              <p className="text-sm text-gray-500">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
