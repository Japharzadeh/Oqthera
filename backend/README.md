# LAST STATION: EARTH — Backend

FastAPI serves the browser game frontend and provides the persistence API.

## Included

- `GET /` serves the root `index.html` frontend
- `GET /api/health` service health check
- `GET /api/saves/{player_id}` list save slots
- `GET /api/saves/{player_id}/{slot}` load a save
- `POST /api/saves/{player_id}/{slot}` create or update a save
- `DELETE /api/saves/{player_id}/{slot}` delete a save
- SQLite by default; configure another SQLAlchemy database URL with `DATABASE_URL`
- CORS origins configured using `CORS_ORIGINS`
- Three save slots per player (`1`–`3`) and versioned JSON state

## Run locally

Run these commands from the repository root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `.env` from `.env.example` only if you do not already have a configured `.env` file:

```bash
cp .env.example .env
```

Start the server from the `backend` directory:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Then open the game frontend at http://127.0.0.1:8000/

- API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/api/health

The frontend is served from the repository-root `index.html`. Keep that file in place relative to the `backend` directory. GitHub Pages cannot run this Python backend; the backend must be hosted on a Python-capable service to serve the frontend this way online.

## Example

```bash
curl -X POST http://127.0.0.1:8000/api/saves/demo-player/1 \
  -H 'Content-Type: application/json' \
  -d '{"state_version":1,"state":{"chapter_index":0,"resources":{"energy":11},"inventory":{},"decisions":{}}}'

curl http://127.0.0.1:8000/api/saves/demo-player/1
```

## Security status

This is a local-development foundation, not a public production service. Authentication, authorization, rate limiting, migrations, and deployment secrets must be added before exposing save endpoints publicly. Until authentication exists, a `player_id` is only an identifier and does not prove ownership of a save. Do not store secrets or sensitive personal data in save state.
