"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { StageCard } from "@/components/pipeline/stage-card";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";
import type { PipelineStage } from "@/lib/pipeline-stages";

interface StageWithPrereqs {
  stage: PipelineStage;
  isCurrent: boolean;
  isCompleted: boolean;
  prereqs: { met: boolean; missing: string[] };
}

interface PipelineClientProps {
  clientId: string;
  currentIndex: number;
  stagesWithPrereqs: StageWithPrereqs[];
}

export function PipelineClient({
  clientId,
  currentIndex,
  stagesWithPrereqs,
}: PipelineClientProps) {
  const router = useRouter();

  const handleAdvance = useCallback(async () => {
    const nextStage = PIPELINE_STAGES[currentIndex + 1];
    if (!nextStage) return;

    await fetch(`/api/clients/${clientId}/pipeline`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_stage: nextStage.key }),
    });

    router.refresh();
  }, [clientId, currentIndex, router]);

  // Show current stage expanded first, then others
  const currentStage = stagesWithPrereqs.find((s) => s.isCurrent);
  const otherStages = stagesWithPrereqs.filter((s) => !s.isCurrent);

  return (
    <div className="space-y-3">
      {/* Current stage expanded */}
      {currentStage && (
        <StageCard
          stage={currentStage.stage}
          clientId={clientId}
          isCurrent
          isCompleted={false}
          prereqs={currentStage.prereqs}
          onAdvance={
            currentIndex < PIPELINE_STAGES.length - 1
              ? handleAdvance
              : undefined
          }
        />
      )}

      {/* Other stages */}
      {otherStages.map(({ stage, isCurrent, isCompleted, prereqs }) => (
        <StageCard
          key={stage.key}
          stage={stage}
          clientId={clientId}
          isCurrent={isCurrent}
          isCompleted={isCompleted}
          prereqs={prereqs}
        />
      ))}
    </div>
  );
}
