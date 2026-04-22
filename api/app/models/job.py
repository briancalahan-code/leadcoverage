from __future__ import annotations
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"


class JobType(str, Enum):
    personalization = "personalization"
    report_generation = "report_generation"
    hubspot_sync = "hubspot_sync"
    brain_populate = "brain_populate"


class Cadence(str, Enum):
    weekly = "weekly"
    biweekly = "biweekly"
    monthly = "monthly"


class Job(BaseModel):
    id: str
    client_id: str
    org_id: str
    job_type: JobType
    status: JobStatus = JobStatus.pending
    progress: int = Field(default=0, ge=0, le=100)
    config: dict | None = None
    result: dict | None = None
    error: str | None = None
    created_by: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime


class JobCreate(BaseModel):
    client_id: str
    job_type: JobType
    config: dict | None = None


class JobSchedule(BaseModel):
    id: str
    client_id: str
    org_id: str
    job_type: JobType
    cadence: Cadence
    config: dict | None = None
    next_run_at: datetime | None = None
    last_run_at: datetime | None = None
    is_active: bool = True
    created_at: datetime
