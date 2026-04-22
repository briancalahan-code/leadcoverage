from __future__ import annotations
from supabase import create_client
from app.config import settings


class IntegrationService:
    def __init__(self):
        self.supabase = create_client(
            settings.supabase_url, settings.supabase_service_role_key
        )

    async def get_client_key(self, client_id: str, service_name: str) -> str | None:
        # Keys are stored encrypted with pgcrypto — decryption happens in SQL
        # TODO: Implement RPC call to decrypt key
        return None

    async def store_client_key(
        self, client_id: str, service_name: str, key: str, secret: str | None = None
    ) -> dict:
        # TODO: Implement RPC call to encrypt and store key via pgcrypto
        return {"message": "Stub — encrypt and store via pgcrypto RPC"}

    async def list_client_keys(self, client_id: str) -> list[dict]:
        result = (
            self.supabase.table("integration_keys")
            .select("id, service_name, is_active, created_at, updated_at")
            .eq("client_id", client_id)
            .execute()
        )
        return result.data or []
