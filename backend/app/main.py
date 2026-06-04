from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import (
    AiAnalysis,
    Alert,
    AlertCollection,
    AlertStatus,
    Investigation,
    InvestigationNotesUpdate,
    KqlGenerationRequest,
    KqlQuery,
    Severity,
    VerdictRequest,
    VerdictResponse,
)
from app.services.alerts import (
    build_ai_analysis,
    build_investigation,
    generate_kql,
    get_alert,
    list_alerts,
    submit_verdict,
    update_investigation_notes,
)


app = FastAPI(
    title="AI SOC Analyst API",
    description="Backend API for alert triage, AI analysis, KQL generation, and verdict workflows.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "ai-soc-analyst-api"}


@app.get("/api/alerts", response_model=AlertCollection)
def alerts(
    severity: Severity | None = None,
    status: AlertStatus | None = None,
) -> AlertCollection:
    return list_alerts(severity=severity, status_filter=status)


@app.get("/api/alerts/{alert_id}", response_model=Alert)
def alert_details(alert_id: str) -> Alert:
    return get_alert(alert_id)


@app.patch("/api/alerts/{alert_id}/notes", response_model=Alert)
def investigation_notes_update(alert_id: str, request: InvestigationNotesUpdate) -> Alert:
    return update_investigation_notes(alert_id, request)


@app.get("/api/alerts/{alert_id}/investigation", response_model=Investigation)
def investigation(alert_id: str) -> Investigation:
    return build_investigation(alert_id)


@app.get("/api/alerts/{alert_id}/analysis", response_model=AiAnalysis)
def ai_analysis(alert_id: str) -> AiAnalysis:
    return build_ai_analysis(alert_id)


@app.post("/api/kql/generate", response_model=KqlQuery)
def kql_generation(request: KqlGenerationRequest) -> KqlQuery:
    return generate_kql(request)


@app.post("/api/verdicts", response_model=VerdictResponse)
def verdict(request: VerdictRequest) -> VerdictResponse:
    return submit_verdict(request)
