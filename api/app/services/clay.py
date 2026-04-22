from __future__ import annotations
import httpx


class ClayService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.clay.com/v1"

    async def enrich_company(self, domain: str) -> dict:
        # TODO: Call Clay API to enrich company data
        return {"domain": domain, "message": "Stub — implement Clay company enrichment"}

    async def enrich_contact(self, email: str) -> dict:
        # TODO: Call Clay API to enrich contact data
        return {"email": email, "message": "Stub — implement Clay contact enrichment"}

    async def run_table(self, table_id: str, inputs: list[dict]) -> dict:
        # TODO: Execute a Clay table with inputs
        return {
            "table_id": table_id,
            "message": "Stub — implement Clay table execution",
        }
