"""
🤖 BlackRoad AI Client Library (Python)
Universal client for all BlackRoad AI models
"""

import httpx
from typing import Optional, Dict, Any, AsyncGenerator
import uuid


class BlackRoadAI:
    """BlackRoad AI Client"""

    def __init__(
        self,
        gateway_url: str = "http://localhost:7000",
        default_model: str = "auto",
        session_id: Optional[str] = None,
        use_memory: bool = True
    ):
        self.gateway_url = gateway_url
        self.default_model = default_model
        self.session_id = session_id or f"session-{uuid.uuid4().hex[:16]}"
        self.use_memory = use_memory
        self.client = httpx.AsyncClient(timeout=60.0)

    async def chat(
        self,
        message: str,
        model: Optional[str] = None,
        specific_model: Optional[str] = None,
        max_tokens: int = 512,
        temperature: float = 0.7,
        use_memory: Optional[bool] = None,
        enable_actions: bool = True,
        session_id: Optional[str] = None,
        prefer_node: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Chat with AI

        Args:
            message: Your message
            model: Model type (auto, qwen, ollama, deepseek)
            specific_model: Specific model (e.g., "qwen2.5:7b" for Ollama)
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature (0.0-1.0)
            use_memory: Use [MEMORY] context
            enable_actions: Enable action execution
            session_id: Session ID for context
            prefer_node: Prefer specific node (e.g., "lucidia")

        Returns:
            AI response dictionary
        """
        response = await self.client.post(
            f"{self.gateway_url}/chat",
            json={
                "message": message,
                "model": model or self.default_model,
                "specific_model": specific_model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "use_memory": use_memory if use_memory is not None else self.use_memory,
                "enable_actions": enable_actions,
                "session_id": session_id or self.session_id,
                "prefer_node": prefer_node
            }
        )
        response.raise_for_status()
        return response.json()

    async def health(self) -> Dict[str, Any]:
        """Get cluster health status"""
        response = await self.client.get(f"{self.gateway_url}/health")
        response.raise_for_status()
        return response.json()

    async def models(self) -> Dict[str, Any]:
        """List available models"""
        response = await self.client.get(f"{self.gateway_url}/models")
        response.raise_for_status()
        return response.json()

    async def broadcast(self, message: str) -> Dict[str, Any]:
        """Broadcast message to all nodes"""
        response = await self.client.post(
            f"{self.gateway_url}/broadcast",
            json={"message": message}
        )
        response.raise_for_status()
        return response.json()

    async def close(self):
        """Close the client"""
        await self.client.aclose()

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()


# Synchronous wrapper
class BlackRoadAISync:
    """Synchronous BlackRoad AI Client"""

    def __init__(self, **kwargs):
        self.gateway_url = kwargs.get("gateway_url", "http://localhost:7000")
        self.default_model = kwargs.get("default_model", "auto")
        self.session_id = kwargs.get("session_id") or f"session-{uuid.uuid4().hex[:16]}"
        self.use_memory = kwargs.get("use_memory", True)

    def chat(
        self,
        message: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Synchronous chat"""
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{self.gateway_url}/chat",
                json={
                    "message": message,
                    "model": kwargs.get("model", self.default_model),
                    "specific_model": kwargs.get("specific_model"),
                    "max_tokens": kwargs.get("max_tokens", 512),
                    "temperature": kwargs.get("temperature", 0.7),
                    "use_memory": kwargs.get("use_memory", self.use_memory),
                    "enable_actions": kwargs.get("enable_actions", True),
                    "session_id": kwargs.get("session_id", self.session_id),
                    "prefer_node": kwargs.get("prefer_node")
                }
            )
            response.raise_for_status()
            return response.json()

    def health(self) -> Dict[str, Any]:
        """Get health"""
        with httpx.Client() as client:
            response = client.get(f"{self.gateway_url}/health")
            response.raise_for_status()
            return response.json()


"""
Usage Examples:

# Async usage
async def main():
    async with BlackRoadAI() as ai:
        response = await ai.chat("Hello AI!")
        print(response['response'])

        # With options
        response = await ai.chat(
            "Explain quantum computing",
            model="qwen",
            max_tokens=1000,
            temperature=0.8
        )
        print(response['response'])

        # Check health
        health = await ai.health()
        print(f"Healthy: {health['healthy_nodes']}/{health['total_nodes']}")

# Sync usage
ai = BlackRoadAISync(gateway_url="http://192.168.4.38:7000")
response = ai.chat("Hello!")
print(response['response'])

# FastAPI integration
from fastapi import FastAPI

app = FastAPI()
ai = BlackRoadAI()

@app.post("/ask")
async def ask(question: str):
    response = await ai.chat(question)
    return {"answer": response['response']}
"""
