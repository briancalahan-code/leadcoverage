export type JobStatus = "pending" | "running" | "completed" | "failed";
export type JobType =
  | "personalization"
  | "report_generation"
  | "hubspot_sync"
  | "brain_populate";

export interface Job {
  id: string;
  client_id: string;
  org_id: string;
  job_type: JobType;
  status: JobStatus;
  progress: number;
  config: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: string | null;
  created_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface JobSchedule {
  id: string;
  client_id: string;
  org_id: string;
  job_type: JobType;
  cadence: "weekly" | "biweekly" | "monthly";
  config: Record<string, unknown>;
  next_run_at: string | null;
  last_run_at: string | null;
  is_active: boolean;
  created_at: string;
}
