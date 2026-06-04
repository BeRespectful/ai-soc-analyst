from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_alerts_include_all_required_severities() -> None:
    response = client.get("/api/alerts")

    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 6
    assert payload["severity_counts"] == {
        "Low": 1,
        "Medium": 2,
        "High": 2,
        "Critical": 1,
    }


def test_alert_details_and_analysis() -> None:
    alert_response = client.get("/api/alerts/ALRT-2026-0001")
    analysis_response = client.get("/api/alerts/ALRT-2026-0001/analysis")

    assert alert_response.status_code == 200
    assert alert_response.json()["severity"] == "Critical"
    assert analysis_response.status_code == 200
    assert "MITRE T1078" in analysis_response.json()["executive_summary"]


def test_generate_kql_for_alert() -> None:
    response = client.post(
        "/api/kql/generate",
        json={
            "alert_id": "ALRT-2026-0002",
            "objective": "Find process and sign-in activity related to ransomware",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert "DeviceProcessEvents" in payload["query"]
    assert "ALRT-2026-0002" in payload["title"]


def test_kql_copilot_generates_investigation_response() -> None:
    response = client.post(
        "/api/kql-copilot",
        json={
            "alert_id": "ALRT-2026-0001",
            "investigation_request": "Find mailbox forwarding rule changes for this user",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["data_source"] == "OfficeActivity"
    assert "OfficeActivity" in payload["query"]
    assert "amaya.reed@contoso.com" in payload["query"]
    assert "ALRT-2026-0001" in payload["explanation"]
    assert len(payload["investigation_steps"]) >= 3


def test_update_alert_status_updates_detail_and_dashboard() -> None:
    alert_id = "ALRT-2026-0001"
    in_progress_response = client.patch(
        f"/api/alerts/{alert_id}/status",
        json={"status": "In Progress"},
    )
    closed_response = client.patch(
        f"/api/alerts/{alert_id}/status",
        json={"status": "Closed"},
    )
    detail_response = client.get(f"/api/alerts/{alert_id}")
    dashboard_response = client.get("/api/alerts")

    assert in_progress_response.status_code == 200
    assert in_progress_response.json()["status"] == "In Progress"
    assert closed_response.status_code == 200
    assert closed_response.json()["status"] == "Closed"
    assert detail_response.json()["status"] == "Closed"

    dashboard_alert = next(
        alert for alert in dashboard_response.json()["alerts"] if alert["id"] == alert_id
    )
    assert dashboard_alert["status"] == "Closed"

    client.patch(f"/api/alerts/{alert_id}/status", json={"status": "New"})


def test_update_alert_status_rejects_unknown_status() -> None:
    response = client.patch(
        "/api/alerts/ALRT-2026-0001/status",
        json={"status": "Triaged"},
    )

    assert response.status_code == 422


def test_update_investigation_notes_persists_on_alert() -> None:
    alert_id = "ALRT-2026-0001"
    notes = "Validated impossible travel and mailbox forwarding rule activity."

    try:
        update_response = client.patch(
            f"/api/alerts/{alert_id}/notes",
            json={"notes": notes},
        )
        detail_response = client.get(f"/api/alerts/{alert_id}")

        assert update_response.status_code == 200
        assert update_response.json()["analyst_notes"] == notes
        assert detail_response.status_code == 200
        assert detail_response.json()["analyst_notes"] == notes
    finally:
        client.patch(f"/api/alerts/{alert_id}/notes", json={"notes": ""})


def test_update_investigation_notes_rejects_oversized_notes() -> None:
    response = client.patch(
        "/api/alerts/ALRT-2026-0001/notes",
        json={"notes": "x" * 3001},
    )

    assert response.status_code == 422


def test_submit_verdict() -> None:
    response = client.post(
        "/api/verdicts",
        json={
            "alert_id": "ALRT-2026-0003",
            "verdict": "Suspicious",
            "analyst_notes": "Needs OAuth audit validation.",
        },
    )

    assert response.status_code == 200
    assert response.json()["verdict"] == "Suspicious"
    assert "Run generated KQL hunts" in response.json()["next_actions"]
