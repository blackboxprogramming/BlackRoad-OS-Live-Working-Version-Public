# OLLAMA.md - Local AI Inference Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Run AI models locally with zero cloud dependencies.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Model Management](#model-management)
4. [BlackRoad Integration](#blackroad-integration)
5. [Model Selection Guide](#model-selection-guide)
6. [Performance Optimization](#performance-optimization)
7. [API Reference](#api-reference)
8. [Multi-Model Orchestration](#multi-model-orchestration)
9. [Edge Deployment](#edge-deployment)
10. [Custom Models](#custom-models)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### Why Local Inference?

BlackRoad OS embraces local-first AI for:

| Benefit | Description |
|---------|-------------|
| **Privacy** | Data never leaves your hardware |
| **Cost** | Zero API costs after setup |
| **Speed** | No network latency |
| **Control** | Full ownership of AI behavior |
| **Offline** | Works without internet |
| **Customization** | Fine-tune for your use case |

### Ollama in BlackRoad

```
┌─────────────────────────────────────────────────────────┐
│                   BlackRoad Agent OS                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ LUCIDIA │  │  ALICE  │  │ OCTAVIA │  │  PRISM  │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │
│       │            │            │            │          │
│       └────────────┴─────┬──────┴────────────┘          │
│                          │                              │
│                 ┌────────▼────────┐                     │
│                 │   MCP Bridge    │                     │
│                 └────────┬────────┘                     │
│                          │                              │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │                    Ollama                          │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐  │  │
│  │  │llama3.2 │ │ mistral │ │ codellama│ │ phi3   │  │  │
│  │  │  :1b    │ │  :7b    │ │  :13b   │ │ :mini  │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### System Requirements

#### Minimum (Edge/Pi)
- **CPU**: ARM64 or x86_64
- **RAM**: 4GB (for 1-3B models)
- **Storage**: 10GB
- **OS**: Linux, macOS, Windows

#### Recommended (Development)
- **CPU**: 8+ cores
- **RAM**: 16GB (for 7B models)
- **GPU**: NVIDIA RTX 3060+ (optional)
- **Storage**: 50GB SSD
- **OS**: Linux or macOS

#### Production (Server)
- **CPU**: 16+ cores
- **RAM**: 64GB+ (for 70B models)
- **GPU**: NVIDIA A100 or RTX 4090
- **Storage**: 500GB NVMe
- **VRAM**: 24GB+ for large models

---

## Installation

### macOS (Homebrew)

```bash
# Install Ollama
brew install ollama

# Start Ollama service
ollama serve

# Verify installation
ollama --version
```

### Linux (Official Script)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start as systemd service
sudo systemctl enable ollama
sudo systemctl start ollama

# Verify
ollama --version
```

### Raspberry Pi

```bash
# Install on ARM64
curl -fsSL https://ollama.com/install.sh | sh

# Configure for limited memory
cat >> ~/.ollama/config.json << 'EOF'
{
  "gpu": false,
  "num_threads": 4,
  "num_ctx": 2048
}
EOF

# Start service
sudo systemctl start ollama
```

### Docker

```bash
# CPU only
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama

# With NVIDIA GPU
docker run -d \
  --name ollama \
  --gpus all \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama
```

### BlackRoad Integration

```bash
# Clone BlackRoad OS
git clone https://github.com/blackboxprogramming/blackroad.git
cd blackroad

# Install Ollama bridge
./scripts/install-ollama-bridge.sh

# Configure local inference
export BLACKROAD_INFERENCE=local
export OLLAMA_HOST=http://localhost:11434
```

---

## Model Management

### Pulling Models

```bash
# Small models (Edge/Pi suitable)
ollama pull llama3.2:1b          # 1.3GB - Fast, general purpose
ollama pull phi3:mini            # 2.3GB - Microsoft's compact model
ollama pull gemma2:2b            # 1.6GB - Google's small model
ollama pull qwen2:0.5b           # 395MB - Tiny but capable

# Medium models (Development)
ollama pull llama3.2:3b          # 2.0GB - Balanced performance
ollama pull mistral:7b           # 4.1GB - Excellent quality
ollama pull codellama:7b         # 3.8GB - Code specialized
ollama pull deepseek-coder:6.7b  # 3.8GB - Code expert

# Large models (Production)
ollama pull llama3.1:70b         # 40GB - State of the art
ollama pull codellama:34b        # 19GB - Best code model
ollama pull mixtral:8x7b         # 26GB - MoE architecture
ollama pull qwen2:72b            # 41GB - Multilingual expert
```

### Listing Models

```bash
# List installed models
ollama list

# Example output:
NAME                    ID              SIZE    MODIFIED
llama3.2:1b            abc123def       1.3 GB  2 hours ago
mistral:7b             def456ghi       4.1 GB  1 day ago
codellama:7b           ghi789jkl       3.8 GB  3 days ago
```

### Model Information

```bash
# Show model details
ollama show llama3.2:1b

# Show modelfile
ollama show llama3.2:1b --modelfile

# Show template
ollama show llama3.2:1b --template
```

### Removing Models

```bash
# Remove a model
ollama rm llama3.2:1b

# Remove all unused models
ollama list | grep -v 'NAME' | awk '{print $1}' | xargs -I {} ollama rm {}
```

### Model Storage

```bash
# Default locations
# macOS: ~/.ollama/models
# Linux: /usr/share/ollama/.ollama/models

# Custom location
export OLLAMA_MODELS=/path/to/models
```

---

## BlackRoad Integration

### MCP Bridge Configuration

```yaml
# mcp-bridge/config.yaml
providers:
  ollama:
    type: ollama
    host: http://localhost:11434
    models:
      default: llama3.2:3b
      code: codellama:7b
      fast: llama3.2:1b
      reasoning: mistral:7b

    settings:
      timeout: 120
      max_retries: 3
      stream: true
```

### Agent Model Assignment

```yaml
# agents/config.yaml
agents:
  LUCIDIA:
    model: mistral:7b
    role: reasoning
    description: Deep analysis and planning

  ALICE:
    model: codellama:7b
    role: worker
    description: Code generation and tasks

  OCTAVIA:
    model: llama3.2:3b
    role: devops
    description: Infrastructure management

  PRISM:
    model: llama3.2:1b
    role: analytics
    description: Fast data processing

  ECHO:
    model: phi3:mini
    role: memory
    description: Memory summarization

  CIPHER:
    model: llama3.2:1b
    role: security
    description: Security scanning
```

### Python Integration

```python
# blackroad/inference/ollama_client.py
import httpx
import json
from typing import AsyncGenerator

class OllamaClient:
    """BlackRoad Ollama integration."""

    def __init__(self, host: str = "http://localhost:11434"):
        self.host = host
        self.client = httpx.AsyncClient(timeout=120.0)

    async def generate(
        self,
        model: str,
        prompt: str,
        system: str = None,
        stream: bool = True,
        **options
    ) -> AsyncGenerator[str, None]:
        """Generate completion with streaming."""

        payload = {
            "model": model,
            "prompt": prompt,
            "stream": stream,
            "options": options
        }

        if system:
            payload["system"] = system

        async with self.client.stream(
            "POST",
            f"{self.host}/api/generate",
            json=payload
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    data = json.loads(line)
                    if "response" in data:
                        yield data["response"]

    async def chat(
        self,
        model: str,
        messages: list,
        stream: bool = True,
        **options
    ) -> AsyncGenerator[str, None]:
        """Chat completion with streaming."""

        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "options": options
        }

        async with self.client.stream(
            "POST",
            f"{self.host}/api/chat",
            json=payload
        ) as response:
            async for line in response.aiter_lines():
                if line:
                    data = json.loads(line)
                    if "message" in data:
                        yield data["message"]["content"]

    async def embed(self, model: str, text: str) -> list[float]:
        """Generate embeddings."""

        response = await self.client.post(
            f"{self.host}/api/embeddings",
            json={"model": model, "prompt": text}
        )
        return response.json()["embedding"]

    async def list_models(self) -> list[dict]:
        """List available models."""

        response = await self.client.get(f"{self.host}/api/tags")
        return response.json()["models"]


# Usage example
async def main():
    client = OllamaClient()

    # Streaming generation
    async for chunk in client.generate(
        model="llama3.2:3b",
        prompt="Explain BlackRoad OS in one paragraph",
        system="You are a helpful AI assistant."
    ):
        print(chunk, end="", flush=True)
```

### Shell Integration

```bash
# scripts/ollama-query.sh
#!/bin/bash

# Query Ollama from command line
ollama_query() {
    local model="${1:-llama3.2:3b}"
    local prompt="$2"

    curl -s http://localhost:11434/api/generate \
        -d "{
            \"model\": \"$model\",
            \"prompt\": \"$prompt\",
            \"stream\": false
        }" | jq -r '.response'
}

# Usage
# ollama_query "llama3.2:3b" "What is 2+2?"
```

---

## Model Selection Guide

### By Use Case

| Use Case | Recommended Model | VRAM | Notes |
|----------|-------------------|------|-------|
| **Edge/Pi** | llama3.2:1b | 2GB | Fast, efficient |
| **Chat** | llama3.2:3b | 4GB | Balanced |
| **Code** | codellama:7b | 6GB | Best for coding |
| **Analysis** | mistral:7b | 6GB | Strong reasoning |
| **Creative** | llama3.1:8b | 8GB | Better creativity |
| **Production** | llama3.1:70b | 48GB | Best quality |

### By Hardware

#### Raspberry Pi 4 (4GB RAM)

```bash
# Best choices for Pi
ollama pull llama3.2:1b    # Primary
ollama pull qwen2:0.5b     # Backup, even smaller

# Configuration
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
```

#### MacBook Air M1 (8GB RAM)

```bash
# Optimal models
ollama pull llama3.2:3b    # Primary
ollama pull phi3:mini      # Fast secondary
ollama pull codellama:7b   # For coding

# Metal acceleration automatic
```

#### Desktop GPU (RTX 3060, 12GB VRAM)

```bash
# Can run larger models
ollama pull mistral:7b
ollama pull codellama:13b
ollama pull llama3.1:8b

# Enable GPU layers
export OLLAMA_GPU_LAYERS=35
```

#### Server GPU (A100, 80GB VRAM)

```bash
# Full power
ollama pull llama3.1:70b
ollama pull codellama:34b
ollama pull mixtral:8x7b
ollama pull qwen2:72b
```

### Performance Comparison

```
Model Performance (tokens/sec on M1 MacBook):

┌─────────────────┬────────────┬───────────┬──────────┐
│ Model           │ Prompt t/s │ Gen t/s   │ Quality  │
├─────────────────┼────────────┼───────────┼──────────┤
│ qwen2:0.5b      │ 180        │ 95        │ ★★☆☆☆   │
│ llama3.2:1b     │ 120        │ 65        │ ★★★☆☆   │
│ phi3:mini       │ 85         │ 45        │ ★★★☆☆   │
│ llama3.2:3b     │ 60         │ 32        │ ★★★★☆   │
│ mistral:7b      │ 35         │ 18        │ ★★★★☆   │
│ codellama:7b    │ 35         │ 18        │ ★★★★☆   │
│ llama3.1:8b     │ 28         │ 15        │ ★★★★★   │
└─────────────────┴────────────┴───────────┴──────────┘
```

---

## Performance Optimization

### Context Window Tuning

```bash
# Reduce context for faster inference
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Hello",
  "options": {
    "num_ctx": 2048,
    "num_predict": 256
  }
}'

# Larger context for complex tasks
curl http://localhost:11434/api/generate -d '{
  "model": "mistral:7b",
  "prompt": "Analyze this codebase...",
  "options": {
    "num_ctx": 8192,
    "num_predict": 2048
  }
}'
```

### Thread Configuration

```bash
# Optimize for your CPU
export OLLAMA_NUM_THREADS=8      # Match physical cores
export OLLAMA_NUM_PARALLEL=2     # Concurrent requests

# Raspberry Pi optimization
export OLLAMA_NUM_THREADS=4
export OLLAMA_NUM_PARALLEL=1
```

### GPU Optimization

```bash
# Full GPU offload (if VRAM allows)
export OLLAMA_GPU_LAYERS=999

# Partial offload (hybrid CPU/GPU)
export OLLAMA_GPU_LAYERS=20      # First 20 layers on GPU

# Disable GPU (CPU only)
export OLLAMA_GPU_LAYERS=0
```

### Memory Management

```bash
# Keep models loaded
export OLLAMA_KEEP_ALIVE=5m      # Keep in memory for 5 minutes

# Immediate unload after use
export OLLAMA_KEEP_ALIVE=0

# Pre-load frequently used models
ollama run llama3.2:3b ""        # Load into memory
```

### Batch Processing

```python
# blackroad/inference/batch.py
import asyncio
from typing import List

async def batch_generate(
    client: OllamaClient,
    prompts: List[str],
    model: str = "llama3.2:3b",
    concurrency: int = 4
) -> List[str]:
    """Process multiple prompts efficiently."""

    semaphore = asyncio.Semaphore(concurrency)

    async def process_one(prompt: str) -> str:
        async with semaphore:
            result = []
            async for chunk in client.generate(model, prompt):
                result.append(chunk)
            return "".join(result)

    tasks = [process_one(p) for p in prompts]
    return await asyncio.gather(*tasks)
```

### Quantization Options

```bash
# Models come in different quantizations
ollama pull llama3.2:1b-q4_0    # 4-bit, smallest
ollama pull llama3.2:1b-q4_k_m  # 4-bit K-quant, balanced
ollama pull llama3.2:1b-q8_0    # 8-bit, best quality
ollama pull llama3.2:1b-fp16    # Full precision, largest
```

---

## API Reference

### Generate Endpoint

```bash
# POST /api/generate
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "Why is the sky blue?",
  "system": "You are a scientist.",
  "stream": true,
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 40,
    "num_predict": 256,
    "num_ctx": 4096,
    "stop": ["\n\n"]
  }
}'
```

### Chat Endpoint

```bash
# POST /api/chat
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.2:3b",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is BlackRoad OS?"}
  ],
  "stream": true
}'
```

### Embeddings Endpoint

```bash
# POST /api/embeddings
curl http://localhost:11434/api/embeddings -d '{
  "model": "nomic-embed-text",
  "prompt": "BlackRoad OS is an AI agent platform"
}'

# Response
{
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

### Model Management Endpoints

```bash
# List models - GET /api/tags
curl http://localhost:11434/api/tags

# Show model - POST /api/show
curl http://localhost:11434/api/show -d '{"name": "llama3.2:3b"}'

# Pull model - POST /api/pull
curl http://localhost:11434/api/pull -d '{"name": "llama3.2:3b"}'

# Delete model - DELETE /api/delete
curl -X DELETE http://localhost:11434/api/delete -d '{"name": "llama3.2:3b"}'

# Copy model - POST /api/copy
curl http://localhost:11434/api/copy -d '{"source": "llama3.2:3b", "destination": "my-model"}'
```

### Health Check

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Response
{
  "version": "0.1.32"
}
```

---

## Multi-Model Orchestration

### Model Router

```python
# blackroad/inference/router.py
from enum import Enum
from dataclasses import dataclass

class TaskType(Enum):
    CHAT = "chat"
    CODE = "code"
    ANALYSIS = "analysis"
    SUMMARY = "summary"
    CREATIVE = "creative"

@dataclass
class ModelConfig:
    name: str
    context_window: int
    speed: str  # fast, medium, slow
    quality: str  # low, medium, high

class ModelRouter:
    """Route requests to optimal models."""

    MODELS = {
        "fast": ModelConfig("llama3.2:1b", 2048, "fast", "medium"),
        "balanced": ModelConfig("llama3.2:3b", 4096, "medium", "high"),
        "code": ModelConfig("codellama:7b", 8192, "slow", "high"),
        "reasoning": ModelConfig("mistral:7b", 8192, "slow", "high"),
    }

    TASK_ROUTING = {
        TaskType.CHAT: "balanced",
        TaskType.CODE: "code",
        TaskType.ANALYSIS: "reasoning",
        TaskType.SUMMARY: "fast",
        TaskType.CREATIVE: "balanced",
    }

    def select_model(
        self,
        task_type: TaskType,
        priority: str = "balanced"  # speed, quality, balanced
    ) -> ModelConfig:
        """Select optimal model for task."""

        base_model = self.TASK_ROUTING[task_type]

        if priority == "speed":
            return self.MODELS["fast"]
        elif priority == "quality":
            return self.MODELS.get(base_model, self.MODELS["reasoning"])
        else:
            return self.MODELS[base_model]
```

### Parallel Model Execution

```python
# blackroad/inference/parallel.py
import asyncio
from typing import Dict

async def parallel_inference(
    clients: Dict[str, OllamaClient],
    prompts: Dict[str, str],  # model -> prompt
) -> Dict[str, str]:
    """Run multiple models in parallel."""

    async def run_model(model: str, prompt: str) -> tuple:
        client = clients.get(model, list(clients.values())[0])
        result = []
        async for chunk in client.generate(model, prompt):
            result.append(chunk)
        return model, "".join(result)

    tasks = [run_model(m, p) for m, p in prompts.items()]
    results = await asyncio.gather(*tasks)
    return dict(results)

# Usage
async def analyze_code(code: str):
    prompts = {
        "codellama:7b": f"Review this code for bugs:\n{code}",
        "mistral:7b": f"Suggest improvements for:\n{code}",
        "llama3.2:1b": f"Summarize what this code does:\n{code}",
    }

    results = await parallel_inference(clients, prompts)
    return results
```

### Model Chain

```python
# blackroad/inference/chain.py

async def model_chain(prompts_and_models: list) -> str:
    """Execute models in sequence, passing output to next."""

    result = ""
    for model, prompt_template in prompts_and_models:
        prompt = prompt_template.format(previous=result)
        result = await generate_complete(model, prompt)

    return result

# Usage: Analyze -> Summarize -> Format
chain = [
    ("mistral:7b", "Analyze this problem: {input}"),
    ("llama3.2:3b", "Summarize this analysis: {previous}"),
    ("llama3.2:1b", "Format as bullet points: {previous}"),
]
```

---

## Edge Deployment

### Raspberry Pi Fleet

```yaml
# deployment/pi-fleet.yaml
fleet:
  - name: lucidia
    ip: 192.168.4.38
    model: llama3.2:1b
    role: primary

  - name: blackroad-pi
    ip: 192.168.4.64
    model: llama3.2:1b
    role: secondary

  - name: lucidia-alt
    ip: 192.168.4.99
    model: qwen2:0.5b
    role: backup
```

### Pi Optimization Script

```bash
#!/bin/bash
# scripts/pi-ollama-setup.sh

# Optimize for Raspberry Pi 4
echo "Configuring Ollama for Raspberry Pi..."

# Create config
mkdir -p ~/.ollama
cat > ~/.ollama/config.json << 'EOF'
{
  "gpu": false,
  "num_threads": 4,
  "num_ctx": 2048,
  "num_batch": 512,
  "num_gqa": 1
}
EOF

# Set environment
cat >> ~/.bashrc << 'EOF'
export OLLAMA_NUM_THREADS=4
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_KEEP_ALIVE=5m
export OLLAMA_HOST=0.0.0.0:11434
EOF

# Enable swap for larger models
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Pull optimized model
ollama pull llama3.2:1b

echo "Setup complete! Restart Ollama service."
```

### Load Balancer

```python
# blackroad/inference/load_balancer.py
import asyncio
from dataclasses import dataclass
from typing import List
import httpx

@dataclass
class OllamaNode:
    host: str
    port: int = 11434
    weight: int = 1
    current_load: int = 0
    healthy: bool = True

class OllamaLoadBalancer:
    """Distribute requests across Ollama nodes."""

    def __init__(self, nodes: List[OllamaNode]):
        self.nodes = nodes
        self.client = httpx.AsyncClient(timeout=120.0)

    async def health_check(self):
        """Check health of all nodes."""
        for node in self.nodes:
            try:
                response = await self.client.get(
                    f"http://{node.host}:{node.port}/api/version",
                    timeout=5.0
                )
                node.healthy = response.status_code == 200
            except Exception:
                node.healthy = False

    def select_node(self) -> OllamaNode:
        """Select least loaded healthy node."""
        healthy = [n for n in self.nodes if n.healthy]
        if not healthy:
            raise Exception("No healthy nodes available")

        # Weighted least connections
        return min(healthy, key=lambda n: n.current_load / n.weight)

    async def generate(self, model: str, prompt: str, **kwargs):
        """Generate with load balancing."""
        node = self.select_node()
        node.current_load += 1

        try:
            async with self.client.stream(
                "POST",
                f"http://{node.host}:{node.port}/api/generate",
                json={"model": model, "prompt": prompt, **kwargs}
            ) as response:
                async for line in response.aiter_lines():
                    yield line
        finally:
            node.current_load -= 1

# Usage
balancer = OllamaLoadBalancer([
    OllamaNode("192.168.4.38", weight=2),  # lucidia (faster)
    OllamaNode("192.168.4.64", weight=1),  # blackroad-pi
    OllamaNode("192.168.4.99", weight=1),  # lucidia-alt
])
```

---

## Custom Models

### Creating a Modelfile

```dockerfile
# models/blackroad-agent.modelfile

# Base model
FROM llama3.2:3b

# System prompt for BlackRoad agents
SYSTEM """
You are a BlackRoad OS agent - part of a distributed AI system running on edge hardware.
Your capabilities include:
- Code analysis and generation
- System monitoring and optimization
- Natural language understanding
- Multi-agent collaboration

Always be helpful, accurate, and efficient. Prioritize local-first operations.
"""

# Parameters
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 4096
PARAMETER stop "<|end|>"
PARAMETER stop "Human:"
PARAMETER stop "User:"

# Template
TEMPLATE """
{{ if .System }}System: {{ .System }}
{{ end }}
{{ if .Prompt }}Human: {{ .Prompt }}
Assistant: {{ .Response }}{{ end }}
"""
```

### Building Custom Model

```bash
# Create the model
ollama create blackroad-agent -f models/blackroad-agent.modelfile

# Test it
ollama run blackroad-agent "What can you help me with?"

# List to verify
ollama list | grep blackroad
```

### Fine-tuning Workflow

```bash
# 1. Prepare training data (JSONL format)
cat > training_data.jsonl << 'EOF'
{"prompt": "What is BlackRoad OS?", "response": "BlackRoad OS is a distributed AI agent platform..."}
{"prompt": "How do agents communicate?", "response": "Agents communicate via MCP bridge..."}
EOF

# 2. Convert to Ollama format
python scripts/convert_training_data.py training_data.jsonl

# 3. Create fine-tuned model
ollama create blackroad-tuned -f tuned.modelfile
```

---

## Troubleshooting

### Common Issues

#### Ollama Won't Start

```bash
# Check if port is in use
lsof -i :11434

# Kill existing process
pkill ollama

# Start fresh
ollama serve

# Check logs
journalctl -u ollama -f  # Linux
tail -f ~/.ollama/logs/server.log  # macOS
```

#### Model Loading Fails

```bash
# Check available memory
free -h  # Linux
vm_stat  # macOS

# Clear model cache
rm -rf ~/.ollama/models/*

# Re-pull model
ollama pull llama3.2:3b
```

#### Slow Performance

```bash
# Check CPU usage
htop

# Reduce context window
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "test",
  "options": {"num_ctx": 2048}
}'

# Use smaller model
ollama run llama3.2:1b
```

#### GPU Not Detected

```bash
# Check NVIDIA drivers
nvidia-smi

# Verify CUDA
nvcc --version

# Reinstall Ollama with GPU support
curl -fsSL https://ollama.com/install.sh | sh

# Force GPU layers
export OLLAMA_GPU_LAYERS=35
```

#### Out of Memory

```bash
# Use quantized model
ollama pull llama3.2:3b-q4_0

# Reduce batch size
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:3b",
  "prompt": "test",
  "options": {"num_batch": 256}
}'

# Limit loaded models
export OLLAMA_MAX_LOADED_MODELS=1
```

### Health Monitoring Script

```bash
#!/bin/bash
# scripts/ollama-health.sh

check_ollama() {
    local host="${1:-localhost}"
    local port="${2:-11434}"

    echo "=== Ollama Health Check ==="
    echo "Host: $host:$port"

    # Version check
    version=$(curl -s "http://$host:$port/api/version" | jq -r '.version')
    echo "Version: $version"

    # Models loaded
    echo -e "\nLoaded Models:"
    curl -s "http://$host:$port/api/tags" | jq -r '.models[] | "  - \(.name) (\(.size | . / 1073741824 | floor)GB)"'

    # Test generation
    echo -e "\nTest Generation:"
    start=$(date +%s%N)
    curl -s "http://$host:$port/api/generate" \
        -d '{"model":"llama3.2:1b","prompt":"Hi","stream":false}' \
        | jq -r '.response' | head -c 50
    end=$(date +%s%N)
    echo -e "\nLatency: $(( (end - start) / 1000000 ))ms"
}

check_ollama "$@"
```

---

## Quick Reference

### Essential Commands

```bash
# Service management
ollama serve                 # Start server
ollama stop                  # Stop server

# Model management
ollama pull <model>          # Download model
ollama list                  # List models
ollama rm <model>            # Remove model
ollama show <model>          # Model info

# Running models
ollama run <model>           # Interactive chat
ollama run <model> "prompt"  # One-shot

# Custom models
ollama create <name> -f <file>  # Create from Modelfile
ollama cp <src> <dst>           # Copy model
```

### Environment Variables

```bash
OLLAMA_HOST=0.0.0.0:11434   # Server bind address
OLLAMA_MODELS=/path/models  # Model storage
OLLAMA_NUM_THREADS=8        # CPU threads
OLLAMA_NUM_PARALLEL=4       # Concurrent requests
OLLAMA_GPU_LAYERS=35        # Layers on GPU
OLLAMA_KEEP_ALIVE=5m        # Model memory time
OLLAMA_MAX_LOADED_MODELS=3  # Max loaded models
```

### Model Sizes

| Model | Parameters | Size | RAM Needed |
|-------|------------|------|------------|
| qwen2:0.5b | 0.5B | 395MB | 2GB |
| llama3.2:1b | 1.2B | 1.3GB | 3GB |
| phi3:mini | 3.8B | 2.3GB | 4GB |
| llama3.2:3b | 3.2B | 2.0GB | 4GB |
| mistral:7b | 7B | 4.1GB | 8GB |
| llama3.1:8b | 8B | 4.7GB | 10GB |
| codellama:13b | 13B | 7.4GB | 16GB |
| llama3.1:70b | 70B | 40GB | 64GB |

---

## Related Documentation

- [RASPBERRY_PI.md](RASPBERRY_PI.md) - Edge deployment with Pi
- [MCP.md](MCP.md) - Model Context Protocol bridge
- [PERFORMANCE.md](PERFORMANCE.md) - Optimization strategies
- [INFRASTRUCTURE.md](INFRASTRUCTURE.md) - Multi-cloud setup
- [AGENTS.md](AGENTS.md) - Agent configurations

---

*Your AI. Your Hardware. Your Rules.*