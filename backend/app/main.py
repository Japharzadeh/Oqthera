from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Path, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import Base, engine, get_db
from app.models import GameSave
from app.schemas import HealthResponse, SavePayload, SaveResponse, SaveSummary

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    description="Persistence API for LAST STATION: EARTH. Authentication is not enabled in this prototype.",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)

DbSession = Annotated[Session, Depends(get_db)]
PlayerId = Annotated[str, Path(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")]
SaveSlot = Annotated[int, Path(ge=1, le=3)]


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
    return HealthResponse(status="ok", service=settings.app_name, environment=settings.app_env)


@app.get("/api/saves/{player_id}", response_model=list[SaveSummary], tags=["saves"])
def list_saves(player_id: PlayerId, db: DbSession) -> list[SaveSummary]:
    rows = db.scalars(
        select(GameSave).where(GameSave.player_id == player_id).order_by(GameSave.slot.asc())
    ).all()
    return [
        SaveSummary(
            player_id=row.player_id,
            slot=row.slot,
            state_version=row.state_version,
            updated_at=row.updated_at,
        )
        for row in rows
    ]


@app.get("/api/saves/{player_id}/{slot}", response_model=SaveResponse, tags=["saves"])
def get_save(player_id: PlayerId, slot: SaveSlot, db: DbSession) -> GameSave:
    row = db.scalar(
        select(GameSave).where(GameSave.player_id == player_id, GameSave.slot == slot)
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Save slot not found")
    return row


@app.post(
    "/api/saves/{player_id}/{slot}",
    response_model=SaveResponse,
    tags=["saves"],
    status_code=status.HTTP_200_OK,
)
def upsert_save(player_id: PlayerId, slot: SaveSlot, payload: SavePayload, db: DbSession) -> GameSave:
    row = db.scalar(
        select(GameSave).where(GameSave.player_id == player_id, GameSave.slot == slot)
    )
    if row is None:
        row = GameSave(
            player_id=player_id,
            slot=slot,
            state_version=payload.state_version,
            state=payload.state,
        )
        db.add(row)
    else:
        row.state_version = payload.state_version
        row.state = payload.state
    db.commit()
    db.refresh(row)
    return row


@app.delete("/api/saves/{player_id}/{slot}", status_code=status.HTTP_204_NO_CONTENT, tags=["saves"])
def delete_save(player_id: PlayerId, slot: SaveSlot, db: DbSession) -> Response:
    row = db.scalar(
        select(GameSave).where(GameSave.player_id == player_id, GameSave.slot == slot)
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Save slot not found")
    db.delete(row)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
