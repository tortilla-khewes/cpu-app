from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt
from datetime import datetime, timedelta
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


class PinRequest(BaseModel):
    pin: str


class TokenResponse(BaseModel):
    token: str
    role: str


def create_token(role: str) -> str:
    payload = {
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=settings.jwt_expire_hours),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


@router.post("/operative", response_model=TokenResponse)
async def operative_login(body: PinRequest):
    # Operative login requires no PIN — any request is accepted.
    # Manager login still requires a PIN (see below).
    return TokenResponse(token=create_token("operative"), role="operative")


@router.post("/manager", response_model=TokenResponse)
async def manager_login(body: PinRequest):
    if body.pin != settings.manager_pin:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    return TokenResponse(token=create_token("manager"), role="manager")


@router.post("/supervisor", response_model=TokenResponse)
async def supervisor_login(body: PinRequest):
    if body.pin != settings.supervisor_pin:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    return TokenResponse(token=create_token("supervisor"), role="supervisor")
