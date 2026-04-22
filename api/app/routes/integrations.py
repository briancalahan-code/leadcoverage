from __future__ import annotations
from fastapi import APIRouter, Depends
from app.auth import get_current_user

router = APIRouter(prefix="/api/integrations", tags=["integrations"])


@router.get("/{client_id}/keys")
async def list_keys(client_id: str, user=Depends(get_current_user)):
    return {
        "client_id": client_id,
        "keys": [],
        "message": "Stub — returns non-secret metadata only",
    }


@router.post("/{client_id}/keys")
async def create_key(client_id: str, user=Depends(get_current_user)):
    return {"message": "Stub — encrypts and stores API key with pgcrypto"}
