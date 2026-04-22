export interface PipelineStage {
  key: string;
  number: number;
  name: string;
  description: string;
  reads: string[];
  writes: string[];
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    key: "stage_1",
    number: 1,
    name: "Understand",
    description:
      "Onboarding & Discovery — deep-dive into client's business, market, and goals",
    reads: [],
    writes: [
      "company_intelligence",
      "icp_definitions",
      "personas",
      "competitive_map",
      "sow_scope",
      "key_contacts",
    ],
  },
  {
    key: "stage_2",
    number: 2,
    name: "Build Audience",
    description:
      "Define ICPs, personas, and target accounts using enrichment data",
    reads: ["company_intelligence", "icp_definitions"],
    writes: ["personas", "icp_definitions", "goals_backwards_math"],
  },
  {
    key: "stage_3",
    number: 3,
    name: "Earn Credibility",
    description: "Develop voice model, message matrix, and content strategy",
    reads: ["personas", "competitive_map", "company_intelligence"],
    writes: ["voice_model", "message_matrix", "content_index"],
  },
  {
    key: "stage_4",
    number: 4,
    name: "Distribute",
    description: "Build and launch campaigns using personalized content",
    reads: ["message_matrix", "content_index", "voice_model", "personas"],
    writes: ["campaign_history", "content_index"],
  },
  {
    key: "stage_5",
    number: 5,
    name: "Track Interest",
    description: "Monitor signals, intent data, and engagement metrics",
    reads: ["campaign_history", "hubspot_health", "goals_backwards_math"],
    writes: ["hubspot_health", "lc_edge_benchmarks"],
  },
  {
    key: "stage_6",
    number: 6,
    name: "Follow Up",
    description: "Personalized follow-up sequences based on tracked signals",
    reads: [
      "hubspot_health",
      "lc_edge_benchmarks",
      "personas",
      "message_matrix",
    ],
    writes: ["campaign_history"],
  },
  {
    key: "stage_7",
    number: 7,
    name: "Measure",
    description: "Review performance, update brain, plan next quarter",
    reads: [
      "campaign_history",
      "hubspot_health",
      "goals_backwards_math",
      "lc_edge_benchmarks",
    ],
    writes: ["goals_backwards_math", "review_rules", "lc_edge_benchmarks"],
  },
];

export function checkPrereqs(
  stage: PipelineStage,
  brainStatus: Record<string, boolean>,
): { met: boolean; missing: string[] } {
  const missing = stage.reads.filter((key) => !brainStatus[key]);
  return { met: missing.length === 0, missing };
}
