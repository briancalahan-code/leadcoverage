from __future__ import annotations

import json

from anthropic import Anthropic
from app.config import settings
from app.services.brain import BrainContext


class AnthropicService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.anthropic_api_key)

    async def personalize(
        self,
        brain: BrainContext,
        target_accounts: list[dict],
        channel: str = "email",
    ) -> list[dict]:
        """Generate personalized outreach for each target account using the client brain."""
        results = []
        for account in target_accounts:
            prompt = self._build_personalization_prompt(brain, account, channel)
            response = self.client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
            )
            results.append(
                {
                    "account": account,
                    "content": response.content[0].text,
                    "channel": channel,
                }
            )
        return results

    def _build_personalization_prompt(
        self, brain: BrainContext, account: dict, channel: str
    ) -> str:
        top_msg = brain.top_message
        return f"""You are a B2B marketing expert writing personalized {channel} outreach.

## Client Context
Company: {brain.company_intelligence.get("what_they_sell", "N/A")}
Value Prop: {brain.company_intelligence.get("why_they_win", "N/A")}
Voice: {brain.voice_model.get("brand_tone_summary", "Professional and direct")}
Phrases to use: {", ".join(brain.voice_model.get("phrases_they_use", []))}
Phrases to avoid: {", ".join(brain.voice_model.get("phrases_they_avoid", []))}

## Target Account
Name: {account.get("name", "Unknown")}
Industry: {account.get("industry", "Unknown")}
Size: {account.get("size", "Unknown")}
Signals: {account.get("signals", "None")}

## Message Framework
Core Message: {top_msg.get("core_message", "N/A") if top_msg else "N/A"}
Pain Point: {top_msg.get("pain_point_addressed", "N/A") if top_msg else "N/A"}
CTA: {top_msg.get("cta", "N/A") if top_msg else "N/A"}

Write a personalized {channel} message for this account. Be specific to their industry and signals. Stay in the client's voice. Under 150 words for email, under 300 chars for LinkedIn."""

    async def generate_report(
        self,
        brain: BrainContext,
        metrics: dict,
        period: str = "Q1 2026",
    ) -> dict:
        """Generate a Stage 7 GTM review report using the client brain and metrics."""
        prompt = f"""Generate a Stage 7 GTM review report.

## Client: {brain.company_intelligence.get("what_they_sell", "Client")}

## Brain Summary
ICPs: {len(brain.icp_definitions)} defined
Personas: {len(brain.personas)} defined
Messages: {len(brain.message_matrix)} in matrix
Campaigns: {len(brain.campaign_history)} tracked
Content: {len(brain.content_index)} pieces indexed

## Metrics
{metrics}

## Goals
{brain.goals}

Write a comprehensive review covering:
1. Pipeline metrics (deals created, pipeline value, velocity)
2. Content performance (top performers, gaps)
3. Signal health (intent signals, engagement trends)
4. Outreach effectiveness (reply rates, meetings booked)
5. Audience growth (new contacts, list health)

Include specific recommendations. Be data-driven. Format as structured markdown."""

        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        return {
            "narrative": response.content[0].text,
            "period": period,
            "dimensions": {
                "pipeline": "See report",
                "content": "See report",
                "signal": "See report",
                "outreach": "See report",
                "audience": "See report",
            },
        }

    async def populate_brain(
        self,
        transcript: str,
        object_types: list[str] | None = None,
    ) -> dict:
        """Extract structured brain data from a sales call transcript via Claude."""
        prompt = f"""Extract structured data from this sales call transcript for a B2B GTM platform.

## Transcript
{transcript}

Extract and return JSON for these objects (only include objects where you find relevant data):
- company_intelligence: what_they_sell, who_they_sell_to, why_they_win, why_they_lose, business_goal, gtm_challenge
- icp_definitions: name, industry_vertical, company_size_range, buying_triggers
- personas: name, title_variants, pain_points, buying_role
- competitive_map: competitor_name, positioning, strengths, weaknesses
- voice_model: brand_tone_summary, communication_style, phrases_they_use

Return as JSON object with keys matching the object names above."""

        response = self.client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )

        try:
            extracted = json.loads(response.content[0].text)
        except json.JSONDecodeError:
            extracted = {"raw_response": response.content[0].text}

        return {"populated_objects": list(extracted.keys()), "data": extracted}
