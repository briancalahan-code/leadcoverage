from __future__ import annotations
from datetime import date, datetime
from pydantic import BaseModel


class Organization(BaseModel):
    id: str
    name: str
    slug: str
    created_at: datetime


class User(BaseModel):
    id: str
    org_id: str
    role: str
    full_name: str
    email: str


class Client(BaseModel):
    id: str
    org_id: str
    name: str
    website: str | None = None
    pipeline_stage: str | None = None
    account_health: str | None = None
    created_at: datetime
    updated_at: datetime


class CompanyIntelligence(BaseModel):
    client_id: str
    what_they_sell: str | None = None
    who_they_sell_to: str | None = None
    why_they_win: str | None = None
    why_they_lose: str | None = None
    business_goal: str | None = None
    gtm_challenge: str | None = None
    product_overview: str | None = None
    sales_handoff_notes: dict | None = None
    seasonal_intelligence: dict | None = None
    win_loss_log: dict | None = None
    icp_validation_notes: dict | None = None
    section_status: str | None = None
    last_updated: datetime | None = None


class ICPDefinition(BaseModel):
    id: str
    client_id: str
    name: str
    company_size_range: str | None = None
    industry_vertical: list[str] | None = None
    geography: list[str] | None = None
    funding_type: str | None = None
    tech_stack_signals: list[str] | None = None
    buying_triggers: dict | None = None
    deal_size_range: str | None = None
    avg_sales_cycle: str | None = None
    disqualifiers: list[str] | None = None
    priority: str | None = None
    tam_estimate: str | None = None
    customer_list_loaded: bool | None = None
    section_status: str | None = None
    last_updated: datetime | None = None


class Persona(BaseModel):
    id: str
    client_id: str
    name: str
    title_variants: list[str] | None = None
    priority: str | None = None
    buying_role: str | None = None
    pain_points: list[str] | None = None
    values: list[str] | None = None
    research_channels: list[str] | None = None
    contact_preference: str | None = None
    communication_style: str | None = None
    section_status: str | None = None
    last_updated: datetime | None = None


class CompetitiveMap(BaseModel):
    id: str
    client_id: str
    competitor_name: str
    positioning: str | None = None
    strengths: str | None = None
    weaknesses: str | None = None
    recent_moves: str | None = None
    differentiators: str | None = None
    win_loss_summary: str | None = None
    objections: dict | None = None
    watch_priority: str | None = None
    section_status: str | None = None
    approved_by: str | None = None
    approval_date: datetime | None = None
    last_updated: datetime | None = None


class VoiceModel(BaseModel):
    client_id: str
    founder_name: str | None = None
    founder_linkedin: str | None = None
    brand_tone_summary: str | None = None
    communication_style: str | None = None
    credible_topics: list[str] | None = None
    avoid_topics: list[str] | None = None
    phrases_they_use: list[str] | None = None
    phrases_they_avoid: list[str] | None = None
    sample_content_good: dict | None = None
    sample_content_bad: dict | None = None
    approved_language: list[str] | None = None
    legal_claims: list[str] | None = None
    channel_voice_notes: dict | None = None
    section_status: str | None = None
    last_updated: datetime | None = None


class MessageMatrix(BaseModel):
    id: str
    client_id: str
    label: str | None = None
    dimension: str | None = None
    core_message: str | None = None
    pain_point_addressed: str | None = None
    proof_point: str | None = None
    cta: str | None = None
    objections_response: dict | None = None
    sample_language: str | None = None
    section_status: str | None = None
    approved_by: str | None = None
    approval_date: datetime | None = None
    next_review_date: date | None = None
    performance_notes: str | None = None
    message_version: int = 1
    last_updated: datetime | None = None


class ContentIndex(BaseModel):
    id: str
    client_id: str
    title: str | None = None
    format: str | None = None
    url: str | None = None
    date_published: date | None = None
    channel: str | None = None
    performance_category: str | None = None
    performance_notes: str | None = None
    is_proof_point: bool | None = None
    proof_point_type: str | None = None
    proof_point_summary: str | None = None
    repurpose_potential: str | None = None
    owner: str | None = None
    status: str | None = None
    last_updated: datetime | None = None


class CampaignHistory(BaseModel):
    id: str
    client_id: str
    name: str | None = None
    status: str | None = None
    channels: list[str] | None = None
    start_date: date | None = None
    end_date: date | None = None
    goal: str | None = None
    result: str | None = None
    worked: str | None = None
    key_metrics: dict | None = None
    lessons_learned: str | None = None
    message_version_at_launch: int | None = None
    messaging_current: bool | None = None
    performance_snapshot: dict | None = None
    last_updated: datetime | None = None


class HubSpotHealth(BaseModel):
    client_id: str
    portal_id: str | None = None
    hubspot_tier: str | None = None
    last_data_hygiene: date | None = None
    contact_db_stats: dict | None = None
    pipeline_config: dict | None = None
    automation_status: dict | None = None
    lc_custom_properties: dict | None = None
    integrations: dict | None = None
    known_issues: dict | None = None
    section_status: str | None = None
    last_updated: datetime | None = None


class ReviewRules(BaseModel):
    client_id: str
    auto_execute_rules: list[str] | None = None
    lc_review_rules: list[str] | None = None
    client_signoff_rules: list[str] | None = None
    custom_rules: dict | None = None
    section_status: str | None = None
    last_updated: datetime | None = None


class KeyContact(BaseModel):
    id: str
    client_id: str
    side: str | None = None
    name: str | None = None
    title: str | None = None
    role: str | None = None
    email: str | None = None
    phone: str | None = None
    is_primary: bool | None = None
    communication_prefs: dict | None = None
    personality_notes: str | None = None
    last_updated: datetime | None = None


class GoalsBackwardsMath(BaseModel):
    id: str
    client_id: str
    period: str | None = None
    revenue_target: float | None = None
    avg_deal_size: float | None = None
    win_rate: float | None = None
    required_pipeline: float | None = None
    required_sqls: int | None = None
    sql_conversion_rate: float | None = None
    required_mqls: int | None = None
    mql_conversion_rate: float | None = None
    required_top_of_funnel: int | None = None
    monthly_mql_target: int | None = None
    current_pipeline: float | None = None
    current_mqls: int | None = None
    on_track: str | None = None
    goal_notes: str | None = None
    last_updated: datetime | None = None


class SOWScope(BaseModel):
    client_id: str
    contract_start: date | None = None
    contract_end: date | None = None
    monthly_retainer: float | None = None
    billing_cycle: str | None = None
    status: str | None = None
    services_in_scope: dict | None = None
    deliverables: dict | None = None
    out_of_scope: list[str] | None = None
    escalation_path: str | None = None
    renewal_notes: str | None = None
    discrepancies: str | None = None
    last_updated: datetime | None = None


class LCEdgeBenchmarks(BaseModel):
    client_id: str
    email_benchmarks: dict | None = None
    linkedin_benchmarks: dict | None = None
    paid_media_benchmarks: dict | None = None
    sales_benchmarks: dict | None = None
    share_of_voice: dict | None = None
    last_updated: datetime | None = None


class IntegrationKey(BaseModel):
    id: str
    client_id: str
    service_name: str
    is_active: bool = True
    metadata: dict | None = None
    created_at: datetime
    updated_at: datetime


class BrainChangeLog(BaseModel):
    id: str
    client_id: str
    object_type: str
    object_id: str
    field_changed: str | None = None
    old_value: str | None = None
    new_value: str | None = None
    changed_by: str | None = None
    source: str | None = None
    created_at: datetime


class ActivityFeed(BaseModel):
    id: str
    client_id: str
    actor_id: str | None = None
    action: str
    object_type: str | None = None
    object_id: str | None = None
    metadata: dict | None = None
    created_at: datetime
