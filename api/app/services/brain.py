from __future__ import annotations

from dataclasses import dataclass, field
from supabase import create_client
from app.config import settings


# Singleton brain objects use client_id as PK — return dict or empty dict.
# Collection brain objects have their own UUID PK — return list.
SINGLETON_TABLES = [
    "company_intelligence",
    "voice_model",
    "hubspot_health",
    "review_rules",
    "sow_scope",
    "lc_edge_benchmarks",
]

COLLECTION_TABLES = [
    "icp_definitions",
    "personas",
    "competitive_map",
    "message_matrix",
    "content_index",
    "campaign_history",
    "key_contacts",
    "goals_backwards_math",
]


@dataclass
class BrainContext:
    """All 14 brain objects for a single client."""

    client_id: str

    # Singletons (dict or empty dict)
    company_intelligence: dict = field(default_factory=dict)
    voice_model: dict = field(default_factory=dict)
    hubspot_health: dict = field(default_factory=dict)
    review_rules: dict = field(default_factory=dict)
    sow_scope: dict = field(default_factory=dict)
    lc_edge_benchmarks: dict = field(default_factory=dict)

    # Collections (list of dicts)
    icp_definitions: list[dict] = field(default_factory=list)
    personas: list[dict] = field(default_factory=list)
    competitive_map: list[dict] = field(default_factory=list)
    message_matrix: list[dict] = field(default_factory=list)
    content_index: list[dict] = field(default_factory=list)
    campaign_history: list[dict] = field(default_factory=list)
    key_contacts: list[dict] = field(default_factory=list)
    goals_backwards_math: list[dict] = field(default_factory=list)

    @property
    def top_message(self) -> dict | None:
        """Return the first message_matrix entry, used in personalization prompts."""
        return self.message_matrix[0] if self.message_matrix else None

    @property
    def goals(self) -> str:
        """Return formatted goals_backwards_math data for prompt injection."""
        if not self.goals_backwards_math:
            return "No goals defined"
        lines: list[str] = []
        for g in self.goals_backwards_math:
            period = g.get("period", "Unknown period")
            revenue = g.get("revenue_target")
            pipeline = g.get("required_pipeline")
            on_track = g.get("on_track", "unknown")
            notes = g.get("goal_notes", "")
            line = (
                f"- {period}: Revenue ${revenue:,.0f}"
                if revenue
                else f"- {period}: Revenue N/A"
            )
            if pipeline:
                line += f" | Pipeline needed ${pipeline:,.0f}"
            line += f" | Status: {on_track}"
            if notes:
                line += f" | {notes}"
            lines.append(line)
        return "\n".join(lines)


def _get_supabase():
    return create_client(settings.supabase_url, settings.supabase_service_role_key)


def fetch_brain_context(client_id: str) -> BrainContext:
    """Fetch all 14 brain objects for a client from Supabase."""
    sb = _get_supabase()
    ctx = BrainContext(client_id=client_id)

    # Fetch singletons — each keyed by client_id
    for table in SINGLETON_TABLES:
        resp = (
            sb.table(table)
            .select("*")
            .eq("client_id", client_id)
            .maybe_single()
            .execute()
        )
        setattr(ctx, table, resp.data or {})

    # Fetch collections — multiple rows per client_id
    for table in COLLECTION_TABLES:
        resp = sb.table(table).select("*").eq("client_id", client_id).execute()
        setattr(ctx, table, resp.data or [])

    return ctx
