from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from app.auth import get_current_user

router = APIRouter(prefix="/api/clients", tags=["clients"])


@router.get("")
async def list_clients(user=Depends(get_current_user)):
    return {"clients": [], "message": "Stub — implement with Supabase query"}


@router.get("/{client_id}")
async def get_client(client_id: str, user=Depends(get_current_user)):
    return {"client_id": client_id, "message": "Stub — implement with Supabase query"}


@router.get("/{client_id}/brain/{object_type}")
async def get_brain_object(
    client_id: str, object_type: str, user=Depends(get_current_user)
):
    valid_objects = [
        "company_intelligence",
        "icp_definitions",
        "personas",
        "competitive_map",
        "voice_model",
        "message_matrix",
        "content_index",
        "campaign_history",
        "hubspot_health",
        "review_rules",
        "key_contacts",
        "goals_backwards_math",
        "sow_scope",
        "lc_edge_benchmarks",
    ]
    if object_type not in valid_objects:
        raise HTTPException(
            status_code=400, detail=f"Invalid brain object: {object_type}"
        )
    return {"client_id": client_id, "object_type": object_type, "message": "Stub"}
