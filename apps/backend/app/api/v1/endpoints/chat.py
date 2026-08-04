from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import httpx
from app.core.config import settings

router = APIRouter()

class ChatMessagePayload(BaseModel):
    message: str
    page_context: Optional[str] = "general"
    session_id: Optional[str] = "default"

@router.post("/message")
async def send_chat_message(payload: ChatMessagePayload):
    """Proxies user natural language requests to the AI Orchestrator multi-agent graph."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{settings.AI_ORCHESTRATOR_URL}/orchestrate",
            json={
                "message": payload.message,
                "page_context": payload.page_context,
                "session_id": payload.session_id
            }
        )
        return resp.json()
