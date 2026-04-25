"""
BlackRoad Voice - Ollama LLM Client
"""
from typing import List, Dict, Generator
import ollama
from rich.console import Console

console = Console()


class OllamaClient:
    """Ollama interface for BlackRoad."""

    def __init__(self, model: str = "llama3.1:latest"):
        self.model = model
        self._verify()

    def _verify(self):
        """Verify Ollama is running."""
        try:
            ollama.list()
        except Exception as e:
            console.print(f"[bold red]Ollama not running:[/] {e}")
            raise

    def chat(self, messages: List[Dict[str, str]]) -> str:
        """Send chat, get response."""
        try:
            response = ollama.chat(model=self.model, messages=messages)
            return response['message']['content']
        except Exception as e:
            return f"LLM Error: {e}"

    def stream(self, messages: List[Dict[str, str]]) -> Generator[str, None, None]:
        """Stream chat response."""
        for chunk in ollama.chat(model=self.model, messages=messages, stream=True):
            yield chunk['message']['content']

    def set_model(self, model: str):
        self.model = model

    @staticmethod
    def list_models() -> List[str]:
        try:
            return [m['name'] for m in ollama.list().get('models', [])]
        except:
            return []
