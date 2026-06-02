import json
from functools import lru_cache
from pathlib import Path

from fastapi import HTTPException, status

from app.models.schemas import (
    AiAnalysis,
    Alert,
    AlertCollection,
    AlertStatus,
    AlertSummary,
    Investigation,
    KqlGenerationRequest,
    KqlQuery,
    Severity,
    TimelineEvent,
    VerdictRequest,
    VerdictResponse,
)


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "sample_alerts.json"
SEVERITIES: tuple[Severity, ...] = ("Low", "Medium", "High", "Critical")


@lru_cache
def load_alerts() -> list[Alert]:
    with DATA_PATH.open(encoding="utf-8") as data_file:
        raw_alerts = json.load(data_file)
    return [Alert.model_validate(alert) for alert in raw_alerts]


def list_alerts(
    severity: Severity | None = None,
    status_filter: AlertStatus | None = None,
) -> AlertCollection:
    alerts = load_alerts()
    if severity:
        alerts = [alert for alert in alerts if alert.severity == severity]
    if status_filter:
        alerts = [alert for alert in alerts if alert.status == status_filter]

    severity_counts = {level: 0 for level in SEVERITIES}
    for alert in load_alerts():
        severity_counts[alert.severity] += 1

    summaries = [
        AlertSummary(
            id=alert.id,
            title=alert.title,
            severity=alert.severity,
            status=alert.status,
            source=alert.source,
            entity=alert.entity,
            timestamp=alert.timestamp,
            tactic=alert.tactic,
            risk_score=alert.risk_score,
        )
        for alert in sorted(alerts, key=lambda item: item.risk_score, reverse=True)
    ]

    return AlertCollection(
        alerts=summaries,
        total=len(summaries),
        severity_counts=severity_counts,
    )


def get_alert(alert_id: str) -> Alert:
    for alert in load_alerts():
        if alert.id == alert_id:
            return alert
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Alert {alert_id} was not found",
    )


def build_investigation(alert_id: str) -> Investigation:
    alert = get_alert(alert_id)
    return Investigation(
        alert_id=alert.id,
        timeline=[
            TimelineEvent(
                time=alert.timestamp,
                activity=f"{alert.source} raised {alert.severity.lower()} severity alert",
                signal=alert.title,
            ),
            TimelineEvent(
                time="T+04m",
                activity=f"Primary entity {alert.entity} correlated with {alert.tactic}",
                signal=f"MITRE {alert.mitre_id} - {alert.technique}",
            ),
            TimelineEvent(
                time="T+11m",
                activity="Evidence package assembled for analyst review",
                signal=", ".join(alert.evidence[:2]),
            ),
        ],
        entities=alert.affected_assets,
        playbook_steps=alert.recommended_actions,
        related_queries=[
            "Summarize alert activity by entity and source IP",
            "Hunt for the same technique across the last 24 hours",
            "Review identity and endpoint telemetry before and after the alert",
        ],
    )


def build_ai_analysis(alert_id: str) -> AiAnalysis:
    alert = get_alert(alert_id)
    return AiAnalysis(
        alert_id=alert.id,
        executive_summary=(
            f"{alert.title} is assessed as {alert.severity.lower()} risk with "
            f"{alert.confidence}% confidence. The signal is centered on {alert.entity} "
            f"and aligns to MITRE {alert.mitre_id} ({alert.technique})."
        ),
        likely_attack_path=[
            f"Initial signal observed in {alert.source}",
            f"Activity mapped to {alert.tactic} using {alert.technique}",
            f"Potential impact involves {', '.join(alert.affected_assets[:2])}",
        ],
        hypothesis=(
            "The alert contains enough correlated telemetry to justify immediate "
            "analyst validation, enrichment, and containment decisioning."
        ),
        recommended_next_steps=alert.recommended_actions,
        confidence=alert.confidence,
    )


def generate_kql(request: KqlGenerationRequest) -> KqlQuery:
    alert = get_alert(request.alert_id)
    entity_literal = alert.entity.replace("'", "\\'")
    title = f"Hunt related {alert.tactic.lower()} activity for {alert.id}"
    query = f"""let alertEntity = '{entity_literal}';
let lookback = 24h;
SecurityAlert
| where TimeGenerated > ago(lookback)
| where AlertName has_any ('{alert.title}', '{alert.technique}', '{alert.mitre_id}')
| union isfuzzy=true (
    SigninLogs
    | where TimeGenerated > ago(lookback)
    | where UserPrincipalName =~ alertEntity or IPAddress has_any ('203.0.113.84', '198.51.100.18')
    | project TimeGenerated, SourceSystem='SigninLogs', UserPrincipalName, IPAddress, AppDisplayName, ResultType
), (
    DeviceProcessEvents
    | where TimeGenerated > ago(lookback)
    | where DeviceName =~ alertEntity or AccountName =~ alertEntity or ProcessCommandLine has_any ('EncodedCommand', 'vssadmin', 'New-InboxRule')
    | project TimeGenerated, SourceSystem='DeviceProcessEvents', DeviceName, AccountName, FileName, ProcessCommandLine
)
| order by TimeGenerated desc"""
    return KqlQuery(
        title=title,
        description=(
            f"Generated for objective: {request.objective}. Uses the alert entity, "
            "technique, and high-value indicators to pivot across Sentinel tables."
        ),
        query=query,
    )


def submit_verdict(request: VerdictRequest) -> VerdictResponse:
    alert = get_alert(request.alert_id)
    next_actions_by_verdict = {
        "True Positive": [
            "Escalate to incident response queue",
            "Start containment playbook",
            "Preserve evidence and notify asset owner",
        ],
        "False Positive": [
            "Document benign rationale",
            "Tune analytics rule suppression criteria",
            "Close alert after peer review",
        ],
        "Suspicious": [
            "Keep alert open for additional enrichment",
            "Run generated KQL hunts",
            "Request endpoint or identity owner validation",
        ],
    }
    disposition = (
        f"{alert.id} marked as {request.verdict}. "
        f"Analyst notes recorded: {request.analyst_notes or 'No notes provided.'}"
    )
    return VerdictResponse(
        alert_id=alert.id,
        verdict=request.verdict,
        disposition=disposition,
        next_actions=next_actions_by_verdict[request.verdict],
    )
