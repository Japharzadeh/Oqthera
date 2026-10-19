# Backend package

The application entry point is now the repository-root `app.py`. Install dependencies from the root `requirements.txt` and start the service from the repository root:

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

This directory retains the settings, SQLAlchemy database, model, and schema modules imported by the root application.
