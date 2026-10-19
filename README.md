# LAST STATION: EARTH

A cinematic browser game with a FastAPI backend for save slots.

## Project layout

```text
Oqthera/
├── app.py
├── requirements.txt
├── .env.example
├── templates/
│   └── index.html
├── static/
│   └── audio/
│       ├── chapter-01-opening.mp3
│       ├── chapter-01-main.mp3
│       ├── chapter-02.mp3
│       ├── chapter-03-opening.mp3
│       ├── chapter-03-main.mp3
│       ├── chapter-04-opening.mp3
│       └── chapter-04-main.mp3
└── backend/
    └── app/
        ├── config.py
        ├── database.py
        ├── models.py
        └── schemas.py
```

## Run locally

Use Python 3.11 or newer.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000. API documentation is available at http://127.0.0.1:8000/docs.

On Windows, activate the environment with `.venv\\Scripts\\activate`.

## API

- `GET /api/health` — service health check
- `GET /api/saves/{player_id}` — list a player's save slots
- `GET /api/saves/{player_id}/{slot}` — load a save
- `POST /api/saves/{player_id}/{slot}` — create or update a save
- `DELETE /api/saves/{player_id}/{slot}` — delete a save

Save slots are numbered 1–3. SQLite is used by default; configure `DATABASE_URL` in `.env` to use another SQLAlchemy-supported database.

## Audio and animation

Narration files are served locally from `static/audio/`; the game no longer needs to query the GitHub API to discover its audio files. The intro starts after the player clicks or presses a key, satisfying browser audio-autoplay restrictions. Story headings animate word by word and narration text reveals with a cinematic character effect. Reduced-motion preferences are respected.

## Security

This is a development foundation. Authentication, authorization, rate limiting, migrations, and deployment secrets should be added before exposing save endpoints publicly. Until authentication exists, `player_id` is only an identifier and does not prove ownership of a save.


## Character creator: custom 3D art pipeline

The character creator currently includes an interactive procedural Three.js preview. Production-quality human models are a separate art deliverable and are not yet bundled.

- Art direction and technical acceptance criteria: [docs/character-art-direction.md](docs/character-art-direction.md)
- GLB asset catalog and skeleton contract: [static/characters/manifest.json](static/characters/manifest.json)
- Asset package/export guidance: [static/characters/README.md](static/characters/README.md)
- GLB loading and asset resolution module: [static/js/character-asset-pipeline.js](static/js/character-asset-pipeline.js)

The pipeline targets separate male/female base meshes, gender-aware hair libraries, rig-compatible modular outfits, and optional accessories. Do not mark the custom asset package ready until the required GLB files have been authored, exported, and validated. The current procedural preview remains the fallback while the manifest status is `awaiting-custom-art-assets`.
