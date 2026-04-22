from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from supabase import create_client
from app.auth import get_current_user
from app.config import settings
from app.models.job import JobCreate
from app.services.anthropic import AnthropicService
from app.services.brain import fetch_brain_context

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def _update_job(sb, job_id: str, data: dict):
    """Helper to update a job record."""
    sb.table("jobs").update(data).eq("id", job_id).execute()


async def _run_personalization(sb, job_id: str, config: dict):
    """Fetch brain context and generate personalized outreach via Claude."""
    client_id = config.get("client_id", "")
    _update_job(sb, job_id, {"progress": 10})

    brain = fetch_brain_context(client_id)
    _update_job(sb, job_id, {"progress": 25})

    service = AnthropicService()
    target_accounts = config.get("target_accounts", [])
    channel = config.get("channel", "email")
    _update_job(sb, job_id, {"progress": 40})

    results = await service.personalize(brain, target_accounts, channel)
    _update_job(sb, job_id, {"progress": 90})

    return {"personalized_count": len(results), "results": results}


async def _run_report_generation(sb, job_id: str, config: dict):
    """Fetch brain context and generate a Stage 7 review report via Claude."""
    client_id = config.get("client_id", "")
    _update_job(sb, job_id, {"progress": 10})

    brain = fetch_brain_context(client_id)
    _update_job(sb, job_id, {"progress": 25})

    service = AnthropicService()
    metrics = config.get("metrics", {})
    period = config.get("period", "Q1 2026")
    _update_job(sb, job_id, {"progress": 40})

    report = await service.generate_report(brain, metrics, period)
    _update_job(sb, job_id, {"progress": 80})

    # Store the generated report in the generated_reports table
    sb.table("generated_reports").insert(
        {
            "client_id": client_id,
            "report_type": "stage_7_review",
            "period": period,
            "narrative": report.get("narrative", ""),
            "dimensions": report.get("dimensions", {}),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    ).execute()
    _update_job(sb, job_id, {"progress": 90})

    return report


async def _run_brain_populate(sb, job_id: str, config: dict):
    """Extract structured brain data from a transcript via Claude."""
    _update_job(sb, job_id, {"progress": 10})

    service = AnthropicService()
    transcript = config.get("transcript", "")
    object_types = config.get("object_types")
    _update_job(sb, job_id, {"progress": 30})

    result = await service.populate_brain(transcript, object_types)
    _update_job(sb, job_id, {"progress": 90})

    return result


async def _run_hubspot_sync(sb, job_id: str, config: dict):
    """HubSpot sync stub -- placeholder for v2 feature."""
    _update_job(sb, job_id, {"progress": 50})
    await asyncio.sleep(1)
    _update_job(sb, job_id, {"progress": 90})

    return {
        "status": "stub",
        "message": "HubSpot sync is a v2 feature -- this is a placeholder.",
    }


# Map job types to their handler functions
_JOB_HANDLERS = {
    "personalization": _run_personalization,
    "report_generation": _run_report_generation,
    "brain_populate": _run_brain_populate,
    "hubspot_sync": _run_hubspot_sync,
}


async def _run_job(job_id: str, job_type: str, config: dict | None):
    """Execute a job asynchronously, dispatching to the appropriate handler."""
    sb = _get_supabase()
    safe_config = config or {}

    # Mark as running
    _update_job(
        sb,
        job_id,
        {
            "status": "running",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "progress": 0,
        },
    )

    try:
        handler = _JOB_HANDLERS.get(job_type)
        if handler:
            result = await handler(sb, job_id, safe_config)
        else:
            result = {"message": f"Unknown job type: {job_type}"}

        _update_job(
            sb,
            job_id,
            {
                "status": "completed",
                "progress": 100,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "result": result,
            },
        )

    except Exception as e:
        _update_job(
            sb,
            job_id,
            {
                "status": "failed",
                "error": str(e),
                "completed_at": datetime.now(timezone.utc).isoformat(),
            },
        )


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
