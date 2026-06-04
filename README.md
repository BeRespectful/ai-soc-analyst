# AI SOC Analyst - Version 1

AI SOC Analyst is a first-version AI-assisted Security Operations Center workflow for alert triage, investigation, KQL generation, and analyst verdict capture.

Version 1 focuses on a Microsoft Sentinel inspired analyst experience backed by a deterministic FastAPI sample-data API. It is designed for product exploration, demo workflows, and future integration with live security data sources.

## Project overview

The application helps analysts move from alert queue to investigation and disposition in one flow:

1. Review active security alerts on a dark SOC dashboard.
2. Open alert details with evidence, metadata, MITRE mapping, and AI-style assessment.
3. Investigate alert timelines, scoped entities, playbook steps, and generated KQL.
4. Capture analyst verdicts for True Positive, False Positive, or Suspicious outcomes.
5. Use the API-backed sample alert dataset to validate end-to-end workflows locally.

## Features

- Dark Microsoft Sentinel inspired React dashboard.
- Security alerts table with Low, Medium, High, and Critical severities.
- Dashboard metric cards for total, critical, open, and closed alert volume.
- Alert distribution charts for severity and workflow status.
- Dashboard search and filters by title, entity, source, tactic, severity, and status.
- Alert details page with metadata, evidence, MITRE mapping, and AI assessment.
- Investigation page with timeline, scoped entities, playbook steps, and KQL generation.
- KQL Copilot style natural-language investigation prompt workflow.
- AI alert summary panel for what happened, suspicious rationale, likely attacker behavior, risk, and next steps.
- Dedicated MITRE ATT&CK panel with technique context and analyst guidance.
- Analyst notes for investigations.
- Alert status workflow for New, In Progress, and Closed states.
- Incident report generator for formatted investigation summaries.
- Verdict panel for True Positive, False Positive, and Suspicious dispositions.
- FastAPI backend with sample alert dataset and deterministic analysis helpers.

## Tech stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide React icons
- CSS with custom dark SOC styling

### Backend

- Python
- FastAPI
- Pydantic
- Uvicorn
- Pytest
- HTTPX test client support

## Screenshots

> Screenshots for Version 1 should be added here.
>
> Suggested captures:
> - Dashboard metrics, filters, and alert queue
> - Critical alert details
> - Investigation timeline and AI summary
> - MITRE ATT&CK guidance panel
> - KQL generation
> - Incident report generator

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── data/sample_alerts.json
│   │   ├── main.py
│   │   ├── models/schemas.py
│   │   └── services/alerts.py
│   ├── requirements.txt
│   └── tests/test_api.py
└── frontend/
    ├── src/
    │   ├── api/client.ts
    │   ├── components/
    │   ├── pages/
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── styles.css
    ├── package.json
    └── vite.config.ts
```

## How to run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## How to run frontend

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://127.0.0.1:5173` and proxies `/api` requests to the backend.

## API endpoints

- `GET /health`
- `GET /api/alerts`
- `GET /api/alerts/{alert_id}`
- `PATCH /api/alerts/{alert_id}/status`
- `PATCH /api/alerts/{alert_id}/notes`
- `GET /api/alerts/{alert_id}/investigation`
- `GET /api/alerts/{alert_id}/analysis`
- `POST /api/kql/generate`
- `POST /api/kql-copilot`
- `POST /api/verdicts`

## Testing commands

Run backend tests:

```bash
cd backend
pytest
```

Run frontend build validation:

```bash
cd frontend
npm run build
```

## Future roadmap

- GPT-5 integration for live AI reasoning and report drafting.
- Microsoft Sentinel integration for real alert ingestion and incident context.
- Real KQL execution against connected Log Analytics workspaces.
- Authentication and role-aware analyst workflows.
- Threat intelligence feeds for enrichment, indicators, and reputation context.
