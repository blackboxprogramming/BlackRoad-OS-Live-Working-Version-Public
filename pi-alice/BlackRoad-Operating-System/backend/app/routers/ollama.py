"""Ollama local LLM router – proxies requests to a local Ollama instance.

Usage
-----
Start Ollama locally::

    ollama serve          # defaults to http://localhost:11434
    ollama pull llama3    # pull a model

Then call::

    POST /api/ollama/chat
    POST /api/ollama/generate
    GET  /api/ollama/models
    GET  /api/ollama/health
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx

from app.config import settings

router = APIRouter(prefix="/api/ollama", tags=["Ollama"])


# ────────────────────────────────────────────────────────────────────────────
# Schemas
# ────────────────────────────────────────────────────────────────────────────

class OllamaChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class OllamaChatRequest(BaseModel):
    model: Optional[str] = None
    messages: List[OllamaChatMessage]
    stream: bool = False
    options: Optional[Dict[str, Any]] = None


class OllamaGenerateRequest(BaseModel):
    model: Optional[str] = None
    prompt: str
    stream: bool = False
    options: Optional[Dict[str, Any]] = None


# ────────────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────────────

def _get_base_url() -> str:
    return settings.OLLAMA_BASE_URL.rstrip("/")


def _get_model(model: Optional[str]) -> str:
    return model or settings.OLLAMA_DEFAULT_MODEL


async def _proxy(method: str, path: str, payload: dict) -> dict:
    url = f"{_get_base_url()}{path}"
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.request(method, url, json=payload)
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Cannot reach Ollama at {_get_base_url()}. "
                "Make sure Ollama is running locally: `ollama serve`"
            ),
        )
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail="Ollama request failed")


# ────────────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────────────

@router.get("/health")
async def ollama_health():
    """Check whether the local Ollama daemon is reachable."""
    url = f"{_get_base_url()}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return {"status": "ok", "base_url": _get_base_url()}
    except Exception:
        return {"status": "unreachable", "base_url": _get_base_url(), "error": "Ollama daemon not reachable"}


@router.get("/models")
async def list_models():
    """List models available in the local Ollama instance."""
    url = f"{_get_base_url()}/api/tags"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return resp.json()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail=f"Cannot reach Ollama at {_get_base_url()}. Run `ollama serve` first.",
        )


@router.post("/chat")
async def ollama_chat(req: OllamaChatRequest):
    """Send a chat completion request to the local Ollama instance.

    Example::

        curl -X POST /api/ollama/chat \\
          -H 'Content-Type: application/json' \\
          -d '{"messages": [{"role": "user", "content": "Hello!"}]}'
    """
    payload: Dict[str, Any] = {
        "model": _get_model(req.model),
        "messages": [m.model_dump() for m in req.messages],
        "stream": False,
    }
    if req.options:
        payload["options"] = req.options
    return await _proxy("POST", "/api/chat", payload)


@router.post("/generate")
async def ollama_generate(req: OllamaGenerateRequest):
    """Send a raw generation request to the local Ollama instance."""
    payload: Dict[str, Any] = {
        "model": _get_model(req.model),
        "prompt": req.prompt,
        "stream": False,
    }
    if req.options:
        payload["options"] = req.options
    return await _proxy("POST", "/api/generate", payload)
