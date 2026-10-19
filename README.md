# LAST STATION: EARTH

**آخرین ایستگاه زمین** — a cinematic browser-game intro for Oqthera.

A dark, atmospheric opening sequence set in 2089, after the collapse of civilization. The player awakens as the last energy engineer, hears from ARIA, and begins to question the story behind the world's silence.

## Current scope

- Animated Three.js environment with a ruined skyline, broken transmission tower, drifting ash, fog, and atmospheric lighting
- Cinematic title screen and responsive layout
- Persian story intro presented in four chapters
- Timed English cinematic narration, subtitles, playback controls, and a separate ARIA voice
- FastAPI backend foundation with health checks and persistent save slots
- The full gameplay loop is not implemented yet; the backend currently provides save persistence, not missions, combat, or multiplayer

## Run the web intro

Because the page uses JavaScript modules, serve it over HTTP instead of opening `index.html` directly.

```bash
python -m http.server 8080
```

Then open http://localhost:8080.

Three.js and fonts are loaded from external CDNs, so an internet connection is needed. Voice playback uses the browser's built-in Speech Synthesis API; voice availability and quality depend on the browser and operating system.

## Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- API health: http://127.0.0.1:8000/api/health
- Interactive API docs: http://127.0.0.1:8000/docs
- Backend details and endpoint examples: [`backend/README.md`](backend/README.md)

SQLite is used by default. Database and CORS settings can be changed in `backend/.env`. The current backend is intended for local development; do not expose save endpoints publicly until authentication and authorization are implemented.

## GitHub Pages

In the repository settings, open **Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. GitHub Pages serves the static intro only; it does not run the FastAPI backend. A deployed game needs a separately hosted backend and a matching `CORS_ORIGINS` setting.

## Project

- Repository: https://github.com/Japharzadeh/Oqthera
- Title: LAST STATION: EARTH
- Tagline: Civilization did not end. It went dark.
