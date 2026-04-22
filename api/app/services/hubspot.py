from __future__ import annotations
import httpx


class HubSpotService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.hubapi.com"

    async def get_contacts(self, limit: int = 100) -> dict:
        # TODO: Implement HubSpot contacts API call
        return {"contacts": [], "message": "Stub — implement HubSpot API integration"}

    async def get_deals(self, limit: int = 100) -> dict:
        # TODO: Implement HubSpot deals API call
        return {"deals": [], "message": "Stub — implement HubSpot API integration"}

    async def get_portal_info(self) -> dict:
        # TODO: Implement HubSpot portal info for hubspot_health brain object
        return {"portal": {}, "message": "Stub — implement HubSpot portal health check"}
