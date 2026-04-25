"""
BlackRoad LocalAI - Local AI model runner and router
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Dict, Optional, Any
import sqlite3
import os
import json
import time
from pathlib import Path


@dataclass
class ModelConfig:
    """Configuration for an AI model"""
    name: str
    provider: str  # ollama, llamacpp, lmstudio, vllm
    endpoint: str
    context_len: int = 4096
    supports_vision: bool = False
    supports_tools: bool = False
    cost_per_token: float = 0.0


class LocalAI:
    """Local AI model runner and router"""
    
    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            db_path = os.path.expanduser("~/.blackroad/localai.db")
        
        self.db_path = db_path
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        
        self._init_db()
        self.models: Dict[str, ModelConfig] = {}
        self._load_models()
        self._register_defaults()
    
    def _init_db(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS models (
                name TEXT PRIMARY KEY,
                provider TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                context_len INTEGER NOT NULL,
                supports_vision INTEGER NOT NULL,
                supports_tools INTEGER NOT NULL,
                cost_per_token REAL NOT NULL
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS usage_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model TEXT NOT NULL,
                task_type TEXT NOT NULL,
                tokens INTEGER NOT NULL,
                latency_ms INTEGER NOT NULL,
                timestamp TEXT NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _load_models(self):
        """Load models from database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT name, provider, endpoint, context_len, supports_vision, supports_tools, cost_per_token FROM models")
        for row in cursor.fetchall():
            name, provider, endpoint, context_len, supports_vision, supports_tools, cost_per_token = row
            self.models[name] = ModelConfig(
                name=name,
                provider=provider,
                endpoint=endpoint,
                context_len=context_len,
                supports_vision=bool(supports_vision),
                supports_tools=bool(supports_tools),
                cost_per_token=cost_per_token
            )
        
        conn.close()
    
    def _register_defaults(self):
        """Register default models if not already registered"""
        defaults = [
            ModelConfig("qwen2.5", "ollama", "http://localhost:11434", context_len=32768),
            ModelConfig("deepseek-r1", "ollama", "http://localhost:11434", context_len=16384),
            ModelConfig("phi-3", "ollama", "http://localhost:11434", context_len=4096)
        ]
        
        for model in defaults:
            if model.name not in self.models:
                self.register_model(
                    model.name,
                    model.provider,
                    model.endpoint,
                    context_len=model.context_len,
                    supports_vision=model.supports_vision,
                    supports_tools=model.supports_tools,
                    cost_per_token=model.cost_per_token
                )
    
    def register_model(self, name: str, provider: str, endpoint: str, 
                      context_len: int = 4096, supports_vision: bool = False,
                      supports_tools: bool = False, cost_per_token: float = 0.0) -> bool:
        """Register a new model"""
        if name in self.models:
            return False
        
        model = ModelConfig(
            name=name,
            provider=provider,
            endpoint=endpoint,
            context_len=context_len,
            supports_vision=supports_vision,
            supports_tools=supports_tools,
            cost_per_token=cost_per_token
        )
        
        self.models[name] = model
        
        # Store in DB
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO models (name, provider, endpoint, context_len, supports_vision, supports_tools, cost_per_token)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (name, provider, endpoint, context_len, int(supports_vision), int(supports_tools), cost_per_token))
        conn.commit()
        conn.close()
        
        return True
    
    def chat(self, model: str, messages: List[Dict], temperature: float = 0.7, 
             max_tokens: int = 2048) -> Optional[str]:
        """Unified chat interface"""
        if model not in self.models:
            return None
        
        config = self.models[model]
        start_time = time.time()
        
        # Mock response routing based on provider
        if config.provider == "ollama":
            response = f"[{model}] Response to: {messages[-1].get('content', 'hello')}"
        elif config.provider == "llamacpp":
            response = f"[llama.cpp] Response to: {messages[-1].get('content', 'hello')}"
        elif config.provider == "lmstudio":
            response = f"[LM Studio] Response to: {messages[-1].get('content', 'hello')}"
        elif config.provider == "vllm":
            response = f"[vLLM] Response to: {messages[-1].get('content', 'hello')}"
        else:
            response = "Unknown provider"
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        # Log usage
        self._log_usage(model, "chat", len(response) // 4, latency_ms)
        
        return response
    
    def generate(self, model: str, prompt: str, **kwargs) -> Optional[str]:
        """Text generation"""
        if model not in self.models:
            return None
        
        start_time = time.time()
        config = self.models[model]
        
        response = f"[{model}] Generated: {prompt}"
        
        latency_ms = int((time.time() - start_time) * 1000)
        self._log_usage(model, "generate", len(response) // 4, latency_ms)
        
        return response
    
    def embed(self, model: str, text: str) -> Optional[List[float]]:
        """Get embeddings"""
        if model not in self.models:
            return None
        
        # Mock embeddings - return 384-dim vector for most models
        return [0.1 + (i % 10) * 0.01 for i in range(384)]
    
    def list_models(self) -> List[Dict]:
        """List all registered models"""
        result = []
        for name, config in self.models.items():
            result.append({
                'name': name,
                'provider': config.provider,
                'endpoint': config.endpoint,
                'context_len': config.context_len,
                'supports_vision': config.supports_vision,
                'supports_tools': config.supports_tools,
                'status': 'online'  # Mock status
            })
        return result
    
    def health_check(self, model: str) -> bool:
        """Check if model endpoint is healthy"""
        if model not in self.models:
            return False
        
        # Mock health check
        return True
    
    def benchmark(self, model: str, prompt: str, n: int = 5) -> Optional[Dict]:
        """Benchmark model performance"""
        if model not in self.models:
            return None
        
        latencies = []
        for _ in range(n):
            start = time.time()
            self.generate(model, prompt)
            latencies.append((time.time() - start) * 1000)
        
        avg_latency = sum(latencies) / len(latencies)
        tokens_per_sec = 1000 / avg_latency * 100  # Rough estimate
        
        return {
            'avg_latency_ms': avg_latency,
            'tokens_per_sec': tokens_per_sec,
            'samples': n
        }
    
    def route_best(self, task_type: str) -> Optional[str]:
        """Pick best model for task type"""
        task_preferences = {
            'code': ['deepseek-r1', 'qwen2.5', 'phi-3'],
            'chat': ['qwen2.5', 'phi-3', 'deepseek-r1'],
            'reasoning': ['deepseek-r1', 'qwen2.5'],
            'creative': ['qwen2.5', 'phi-3'],
            'fast': ['phi-3', 'qwen2.5', 'deepseek-r1']
        }
        
        preferred = task_preferences.get(task_type, list(self.models.keys()))
        for model in preferred:
            if model in self.models:
                return model
        
        return list(self.models.keys())[0] if self.models else None
    
    def fallback_chain(self, models: List[str], messages: List[Dict]) -> Optional[str]:
        """Try models in order until one responds"""
        for model in models:
            try:
                response = self.chat(model, messages)
                if response:
                    return response
            except Exception:
                continue
        
        return None
    
    def _log_usage(self, model: str, task_type: str, tokens: int, latency_ms: int):
        """Log model usage"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO usage_logs (model, task_type, tokens, latency_ms, timestamp)
            VALUES (?, ?, ?, ?, ?)
        """, (model, task_type, tokens, latency_ms, datetime.now().isoformat()))
        conn.commit()
        conn.close()


if __name__ == '__main__':
    import sys
    
    ai = LocalAI()
    
    if len(sys.argv) < 2:
        print("Usage: python local_ai.py <command> [args]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'models':
        models = ai.list_models()
        for m in models:
            print(f"{m['name']} ({m['provider']}) - {m['context_len']} ctx")
    
    elif cmd == 'chat':
        model = sys.argv[2]
        prompt = sys.argv[3] if len(sys.argv) > 3 else "Hello"
        response = ai.chat(model, [{'role': 'user', 'content': prompt}])
        print(response)
    
    elif cmd == 'health':
        for name in ai.models:
            status = "✓" if ai.health_check(name) else "✗"
            print(f"{status} {name}")
