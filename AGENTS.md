# AGENTS.md

## Cursor Cloud specific instructions

### Repository branches

- **`main`** currently contains only the project README and license (no `backend/` or `frontend/`).
- The runnable **AI SOC Analyst** app lives on branch **`cursor/ai-soc-analyst-platform-9fb7`**. If those directories are missing after clone, check out that branch (or merge it) before installing dependencies or starting services.

### System prerequisites (one-time per VM)

Ubuntu images may ship without `python3-venv`. Install it before creating the backend virtualenv:

```bash
sudo apt-get install -y python3.12-venv
```

### Dependency refresh (automatic on VM startup)

See the VM update script: backend venv + `pip install -r requirements.txt`, and `npm install` under `frontend/` when those paths exist.

### Services (full UI end-to-end)

| Service | Command | URL |
|---------|---------|-----|
| FastAPI API | From `backend/`: `source .venv/bin/activate`, `export PYTHONPATH=.`, `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` | http://127.0.0.1:8000 |
| Vite UI | From `frontend/`: `npm run dev` | http://127.0.0.1:5173 |

Vite proxies `/api` and `/health` to port 8000 (see `frontend/vite.config.ts`). No database, Docker, or external Sentinel/LLM services are required for local development.

Use **tmux** for long-running dev servers in Cloud Agent VMs.

### Lint, test, build

| Area | Command | Notes |
|------|---------|-------|
| Backend tests | `cd backend && PYTHONPATH=. .venv/bin/pytest` | `PYTHONPATH=.` is required so `app` imports resolve |
| Frontend lint | `cd frontend && npm run lint` | TypeScript `tsc --noEmit` only |
| Frontend build | `cd frontend && npm run build` | |

There is no backend linter configured in the repo.

### Hello-world validation

1. `curl http://127.0.0.1:8000/health`
2. Open http://127.0.0.1:5173, triage an alert, open **Investigation**, **Generate KQL**, and **Submit verdict**.

Standard run instructions are also in [README.md](README.md).
