from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from supabase import create_client
from app.auth import get_current_user
from app.config import settings
from app.models.job import JobCreate

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


async def _run_job(job_id: str, job_type: str, config: dict | None):
    """Execute a job asynchronously, updating progress as it runs.

    Each job type is a stub that simulates progress via sleep steps.
    Real implementations will be wired in Task 11.
    """
    sb = _get_supabase()

    # Mark as running
    sb.table("jobs").update(
        {
            "status": "running",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "progress": 0,
        }
    ).eq("id", job_id).execute()

    try:
        steps = [25, 50, 75, 100]
        for pct in steps:
            await asyncio.sleep(1)  # Simulate work
            sb.table("jobs").update({"progress": pct}).eq("id", job_id).execute()

        sb.table("jobs").update(
            {
                "status": "completed",
                "progress": 100,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "result": {"message": f"{job_type} completed (stub)"},
            }
        ).eq("id", job_id).execute()

    except Exception as e:
        sb.table("jobs").update(
            {
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("id", job_id).execute()


@router.post("/execute/{job_id}")
async def execute_job(
    job_id: str,
    background_tasks: BackgroundTasks,
    user=Depends(get_current_user),
):
    sb = _get_supabase()
    resp = sb.table("jobs").select("*").eq("id", job_id).single().execute()

    if not resp.data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = resp.data
    if job["status"] != "pending":
        raise HTTPException(status_code=409, detail="Job is not in pending status")

    background_tasks.add_task(_run_job, job_id, job["job_type"], job.get("config"))
    return {"message": "Job execution started", "job_id": job_id}


@router.get("/{job_id}/status")
async def get_job_status(job_id: str, user=Depends(get_current_user)):
    sb = _get_supabase()
    resp = (
        sb.table("jobs")
        .select("id, status, progress, error, result, started_at, completed_at")
        .eq("id", job_id)
        .single()
        .execute()
    )

    if not resp.data:
        raise HTTPException(status_code=404, detail="Job not found")

    return resp.data
