# AI SOC Analyst

First version of an AI-assisted SOC Analyst platform for alert triage, investigation, KQL generation, and analyst verdict capture.

## Features

- Dark Microsoft Sentinel inspired React dashboard
- Security alerts table with Low, Medium, High, and Critical severities
- Alert details page with metadata, evidence, MITRE mapping, and AI assessment
- Investigation page with timeline, scoped entities, playbook steps, and KQL generation
- KQL Copilot for natural language investigation requests with query explanations
- AI analysis panel with summary, likely attack path, recommendations, and confidence
- Verdict panel for True Positive, False Positive, and Suspicious dispositions
- FastAPI backend with sample alert dataset and deterministic analysis helpers

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

## Run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Run the frontend

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

## Validation

```bash
cd backend && pytest
cd frontend && npm run build
```
