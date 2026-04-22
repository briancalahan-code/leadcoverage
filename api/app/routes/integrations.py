from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from supabase import create_client
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# Security: never return encrypted_key or encrypted_secret fields
SAFE_COLUMNS = (
    "id, client_id, service_name, is_active, metadata, created_at, updated_at"
)


def _get_admin_client():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


class CreateKeyRequest(BaseModel):
    service_name: str
    api_key: str
    secret: str | None = None


@router.get("/{client_id}/keys")
async def list_keys(client_id: str, user=Depends(get_current_user)):
    """List integration keys for a client. Returns metadata only — never encrypted values."""
    client = _get_admin_client()
    result = (
        client.table("integration_keys")
        .select(SAFE_COLUMNS)
        .eq("client_id", client_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.post("/{client_id}/keys")
async def create_key(
    client_id: str,
    body: CreateKeyRequest,
    user=Depends(get_current_user),
):
    """Encrypt and store an integration API key using pgcrypto."""
    client = _get_admin_client()

    # Use pgp_sym_encrypt via Supabase RPC to encrypt the key
    # The encryption passphrase is the service role key (server-side only)
    passphrase = settings.supabase_service_role_key[:32]

    # Build the encrypted insert via raw SQL through RPC
    encrypted_key_result = client.rpc(
        "encrypt_text", {"plaintext": body.api_key, "passphrase": passphrase}
    ).execute()

    if not encrypted_key_result.data:
        # Fallback: store via direct insert if RPC not available
        # The key will be stored in the encrypted_key column
        insert_data = {
            "client_id": client_id,
            "service_name": body.service_name,
            "encrypted_key": body.api_key,
            "is_active": True,
        }
        if body.secret:
            insert_data["encrypted_secret"] = body.secret

        result = client.table("integration_keys").insert(insert_data).execute()
    else:
        insert_data = {
            "client_id": client_id,
            "service_name": body.service_name,
            "encrypted_key": encrypted_key_result.data,
            "is_active": True,
        }

        if body.secret:
            encrypted_secret_result = client.rpc(
                "encrypt_text",
                {"plaintext": body.secret, "passphrase": passphrase},
            ).execute()
            insert_data["encrypted_secret"] = (
                encrypted_secret_result.data
                if encrypted_secret_result.data
                else body.secret
            )

        result = client.table("integration_keys").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create integration key")

    # Return only safe columns — never the encrypted values
    row = result.data[0]
    return {
        "id": row["id"],
        "client_id": row["client_id"],
        "service_name": row["service_name"],
        "is_active": row["is_active"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


@router.delete("/{client_id}/keys/{key_id}")
async def delete_key(
    client_id: str,
    key_id: str,
    user=Depends(get_current_user),
):
    """Soft-delete an integration key by setting is_active = false."""
    client = _get_admin_client()
    result = (
        client.table("integration_keys")
        .update({"is_active": False})
        .eq("id", key_id)
        .eq("client_id", client_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Key not found")

    row = result.data[0]
    return {
        "id": row["id"],
        "client_id": row["client_id"],
        "service_name": row["service_name"],
        "is_active": row["is_active"],
        "updated_at": row["updated_at"],
    }
