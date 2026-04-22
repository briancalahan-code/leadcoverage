import { createClient } from "@/lib/supabase/server";
import { WorkflowCard } from "@/components/engine/workflow-card";
import { JobQueueTable } from "@/components/engine/job-queue-table";
import type { Job, JobSchedule } from "@/types/jobs";

const WORKFLOWS = [
  {
    title: "Personalization",
    description:
      "Generate personalized outreach using client brain + Claude AI",
    icon: "✨",
    jobType: "personalization" as const,
  },
  {
    title: "Report Generation",
    description: "Create Stage 7 review with 5-dimension analysis",
    icon: "📊",
    jobType: "report_generation" as const,
  },
  {
    title: "HubSpot Sync",
    description: "Sync contacts, deals, and engagement data from HubSpot",
    icon: "🔄",
    jobType: "hubspot_sync" as const,
  },
];

function formatScheduleLabel(schedule: JobSchedule): string {
  const cadenceLabels: Record<string, string> = {
    weekly: "Weekly",
    biweekly: "Biweekly",
    monthly: "Monthly",
  };
  return cadenceLabels[schedule.cadence] ?? schedule.cadence;
}

export default async function EnginePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: jobs }, { data: schedules }] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("job_schedules")
      .select("*")
      .eq("client_id", id)
      .eq("is_active", true),
  ]);

  const scheduleMap = new Map<string, string>();
  if (schedules) {
    for (const s of schedules as JobSchedule[]) {
      scheduleMap.set(s.job_type, formatScheduleLabel(s));
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Personalization Engine
        </h2>
        <p className="text-sm text-gray-500">
          AI-powered workflows and job queue for this client
        </p>
      </div>

      {/* Workflow cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {WORKFLOWS.map((wf) => (
          <WorkflowCard
            key={wf.jobType}
            title={wf.title}
            description={wf.description}
            icon={wf.icon}
            jobType={wf.jobType}
            clientId={id}
            activeSchedule={scheduleMap.get(wf.jobType) ?? null}
          />
        ))}
      </div>

      {/* Job queue */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Job Queue
        </h3>
        <JobQueueTable clientId={id} initialJobs={(jobs as Job[]) ?? []} />
      </div>
    </div>
  );
}
