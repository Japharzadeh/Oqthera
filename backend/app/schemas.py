from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SavePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    state_version: int = Field(default=1, ge=1, le=100)
    state: dict[str, Any] = Field(min_length=1)


class SaveResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    player_id: str
    slot: int
    state_version: int
    state: dict[str, Any]
    created_at: datetime
    updated_at: datetime


class SaveSummary(BaseModel):
    player_id: str
    slot: int
    state_version: int
    updated_at: datetime


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str
