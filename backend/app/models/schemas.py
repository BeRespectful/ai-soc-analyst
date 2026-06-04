from typing import Literal

from pydantic import BaseModel, Field


Severity = Literal["Low", "Medium", "High", "Critical"]
AlertStatus = Literal["New", "In Progress", "Triaged", "Closed"]
AlertWorkflowStatus = Literal["New", "In Progress", "Closed"]
Verdict = Literal["True Positive", "False Positive", "Suspicious"]


class Alert(BaseModel):
    id: str
    title: str
    severity: Severity
    status: AlertStatus
    source: str
    tactic: str
    technique: str
    entity: str
    timestamp: str
    mitre_id: str
    description: str
    evidence: list[str]
    affected_assets: list[str]
    recommended_actions: list[str]
    confidence: int = Field(ge=0, le=100)
    risk_score: int = Field(ge=0, le=100)


class AlertSummary(BaseModel):
    id: str
    title: str
    severity: Severity
    status: AlertStatus
    source: str
    entity: str
    timestamp: str
    tactic: str
    risk_score: int = Field(ge=0, le=100)


class AlertCollection(BaseModel):
    alerts: list[AlertSummary]
    total: int
    severity_counts: dict[Severity, int]


class TimelineEvent(BaseModel):
    time: str
    activity: str
    signal: str


class Investigation(BaseModel):
    alert_id: str
    timeline: list[TimelineEvent]
    entities: list[str]
    playbook_steps: list[str]
    related_queries: list[str]


class AiAnalysis(BaseModel):
    alert_id: str
    executive_summary: str
    likely_attack_path: list[str]
    hypothesis: str
    recommended_next_steps: list[str]
    confidence: int = Field(ge=0, le=100)


class KqlGenerationRequest(BaseModel):
    alert_id: str
    objective: str = Field(
        default="Find related activity for the alert",
        min_length=3,
        max_length=240,
    )


class KqlQuery(BaseModel):
    title: str
    description: str
    query: str


class KqlCopilotRequest(BaseModel):
    investigation_request: str = Field(min_length=3, max_length=500)
    alert_id: str | None = None


class KqlCopilotResponse(BaseModel):
    query: str
    explanation: str
    data_source: str
    investigation_steps: list[str]


class AlertStatusUpdate(BaseModel):
    status: AlertWorkflowStatus


class VerdictRequest(BaseModel):
    alert_id: str
    verdict: Verdict
    analyst_notes: str = Field(default="", max_length=1000)


class VerdictResponse(BaseModel):
    alert_id: str
    verdict: Verdict
    disposition: str
    next_actions: list[str]
