import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { BRAIN_OBJECTS } from "@/lib/brain-objects";
import { PIPELINE_STAGES, checkPrereqs } from "@/lib/pipeline-stages";
import { PipelineClient } from "./pipeline-client";

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

  // Build brain status: which brain objects have data
  const brainStatus: Record<string, boolean> = {};
  await Promise.all(
    BRAIN_OBJECTS.map(async (obj) => {
      if (obj.singleton) {
        const { data } = await supabase
          .from(obj.table)
          .select("client_id")
          .eq("client_id", id)
          .maybeSingle();
        brainStatus[obj.key] = !!data;
      } else {
        const { count } = await supabase
          .from(obj.table)
          .select("*", { count: "exact", head: true })
          .eq("client_id", id);
        brainStatus[obj.key] = (count ?? 0) > 0;
      }
    }),
  );

  const currentIndex = PIPELINE_STAGES.findIndex(
    (s) => s.key === client.pipeline_stage,
  );

  const stagesWithPrereqs = PIPELINE_STAGES.map((stage, i) => ({
    stage,
    isCurrent: i === currentIndex,
    isCompleted: i < currentIndex,
    prereqs: checkPrereqs(stage, brainStatus),
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Pipeline</h2>
        <p className="text-sm text-gray-500">
          7-stage GTM pipeline &mdash; track progress and prerequisites
        </p>
      </div>

      {/* Horizontal stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {PIPELINE_STAGES.map((stage, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div
                key={stage.key}
                className="flex items-center flex-1 last:flex-0"
              >
                {/* Dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isCurrent
                          ? "bg-indigo-500 border-indigo-500 text-white ring-4 ring-indigo-200 animate-pulse"
                          : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stage.number
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                      isCompleted
                        ? "text-emerald-600"
                        : isCurrent
                          ? "text-indigo-600"
                          : "text-gray-400"
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
                {/* Connector line */}
                {i < PIPELINE_STAGES.length - 1 && (
                  <div className="flex-1 mx-2 mt-[-1.25rem]">
                    <div
                      className={`h-0.5 w-full ${
                        i < currentIndex
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-500"
                          : i === currentIndex
                            ? "bg-gradient-to-r from-indigo-500 to-gray-300"
                            : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage cards */}
      <PipelineClient
        clientId={id}
        currentIndex={currentIndex}
        stagesWithPrereqs={stagesWithPrereqs}
      />
    </div>
  );
}
