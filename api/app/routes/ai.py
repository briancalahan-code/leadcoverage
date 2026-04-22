from __future__ import annotations
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.auth import get_current_user
from app.services.anthropic import AnthropicService

router = APIRouter(prefix="/api/ai", tags=["ai"])


class PersonalizeRequest(BaseModel):
    client_id: str
    target_persona_id: str | None = None
    target_icp_id: str | None = None
    channel: str | None = None
    context: str | None = None


class ReportRequest(BaseModel):
    client_id: str
    report_type: str = "stage_7_review"
    period: str | None = None


class BrainPopulateRequest(BaseModel):
    client_id: str
    transcript: str
    object_types: list[str] | None = None


@router.post("/personalize")
async def personalize(request: PersonalizeRequest, user=Depends(get_current_user)):
    service = AnthropicService()
    result = await service.personalize(
        client_id=request.client_id,
        target_persona_id=request.target_persona_id,
        target_icp_id=request.target_icp_id,
        channel=request.channel,
        context=request.context,
    )
    return result


@router.post("/report")
async def generate_report(request: ReportRequest, user=Depends(get_current_user)):
    service = AnthropicService()
    result = await service.generate_report(
        client_id=request.client_id,
        report_type=request.report_type,
        period=request.period,
    )
    return result


@router.post("/brain-populate")
async def brain_populate(request: BrainPopulateRequest, user=Depends(get_current_user)):
    service = AnthropicService()
    result = await service.populate_brain(
        client_id=request.client_id,
        transcript=request.transcript,
        object_types=request.object_types,
    )
    return result
