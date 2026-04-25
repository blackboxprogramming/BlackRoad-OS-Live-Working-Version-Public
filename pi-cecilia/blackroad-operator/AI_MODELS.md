# AI_MODELS.md - Model Catalog & Guide

> **BlackRoad OS** - Your AI. Your Hardware. Your Rules.
>
> Comprehensive guide to AI models for local and cloud inference.

---

## Table of Contents

1. [Overview](#overview)
2. [Model Categories](#model-categories)
3. [Local Models (Ollama)](#local-models-ollama)
4. [Cloud Models](#cloud-models)
5. [Embedding Models](#embedding-models)
6. [Specialized Models](#specialized-models)
7. [Model Selection Guide](#model-selection-guide)
8. [Performance Benchmarks](#performance-benchmarks)
9. [Cost Analysis](#cost-analysis)
10. [Integration](#integration)

---

## Overview

### Model Philosophy

BlackRoad OS supports a hybrid model strategy:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Model Hierarchy                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Tier 1: Local Edge Models                   │    │
│  │     llama3.2:1b | phi3:mini | qwen2:0.5b               │    │
│  │     Ultra-fast, privacy-first, zero cost               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Tier 2: Local Workstation                   │    │
│  │     llama3.2:3b | mistral:7b | codellama:7b            │    │
│  │     Balanced performance, local control                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Tier 3: Cloud API Models                    │    │
│  │     claude-sonnet-4-5 | gpt-4o | gemini-2.0             │    │
│  │     Maximum capability, pay-per-use                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Tier 4: Frontier Models                     │    │
│  │     claude-opus-4-5 | o1 | gemini-ultra                 │    │
│  │     Research, complex reasoning                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Model Selection Matrix

| Use Case | Recommended | Fallback | Cost |
|----------|-------------|----------|------|
| Quick chat | llama3.2:1b | phi3:mini | Free |
| Code generation | codellama:7b | claude-sonnet-4-5 | Free/$$ |
| Deep analysis | claude-opus-4-5 | mistral:7b | $$$/Free |
| Embeddings | nomic-embed-text | text-embedding-3-small | Free/$ |
| Vision | llava:7b | gpt-4o | Free/$$ |
| Edge/Pi | llama3.2:1b | qwen2:0.5b | Free |

---

## Model Categories

### By Capability

```yaml
models:
  general_purpose:
    - llama3.2 (1b, 3b)
    - mistral (7b)
    - claude-sonnet-4-5
    - gpt-4o

  code_specialized:
    - codellama (7b, 13b, 34b)
    - deepseek-coder (6.7b, 33b)
    - claude-sonnet-4-5  # Excellent at code
    - gpt-4o

  reasoning:
    - claude-opus-4-5
    - o1
    - mistral-large

  vision:
    - llava (7b, 13b)
    - gpt-4o
    - claude-sonnet-4-5

  embeddings:
    - nomic-embed-text
    - text-embedding-3-small
    - text-embedding-3-large

  creative:
    - claude-sonnet-4-5
    - llama3.1:8b
    - mixtral:8x7b
```

### By Size

```
┌──────────────────────────────────────────────────────────────────┐
│                     Model Size Spectrum                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TINY          SMALL         MEDIUM        LARGE        MASSIVE  │
│  <1B           1-3B          7-13B         30-70B       >100B    │
│                                                                   │
│  qwen2:0.5b    llama3.2:1b   mistral:7b    llama3.1:70b  API     │
│  phi3:mini     llama3.2:3b   codellama:7b  mixtral:8x7b  Only    │
│                phi3:small    llama3.1:8b   qwen2:72b             │
│                                                                   │
│  ────────────────────────────────────────────────────────────    │
│  RAM: 2GB      RAM: 4GB      RAM: 8-16GB   RAM: 48-80GB         │
│  Pi-friendly   Laptop        Desktop/GPU   Server/Cloud          │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Local Models (Ollama)

### Recommended Models

#### LLaMA 3.2 (Meta)

```yaml
llama3.2:
  versions:
    - name: llama3.2:1b
      parameters: 1.2B
      size: 1.3GB
      context: 128K
      quantization: Q4_K_M
      use_cases:
        - Quick chat responses
        - Simple Q&A
        - Edge deployment
        - High throughput
      performance:
        tokens_per_second: 65
        prompt_eval: 120
      hardware:
        min_ram: 3GB
        recommended: Raspberry Pi 4, MacBook Air

    - name: llama3.2:3b
      parameters: 3.2B
      size: 2.0GB
      context: 128K
      quantization: Q4_K_M
      use_cases:
        - General conversation
        - Summarization
        - Translation
        - Balanced tasks
      performance:
        tokens_per_second: 32
        prompt_eval: 60
      hardware:
        min_ram: 4GB
        recommended: MacBook, Desktop

  strengths:
    - Excellent instruction following
    - Long context window (128K)
    - Multilingual support
    - Open weights

  ollama_commands:
    pull: ollama pull llama3.2:3b
    run: ollama run llama3.2:3b
```

#### Mistral 7B (Mistral AI)

```yaml
mistral:7b:
  parameters: 7B
  size: 4.1GB
  context: 32K
  quantization: Q4_K_M

  use_cases:
    - Complex reasoning
    - Code review
    - Document analysis
    - Creative writing

  performance:
    tokens_per_second: 18
    prompt_eval: 35

  hardware:
    min_ram: 8GB
    recommended: MacBook Pro, Desktop with GPU

  strengths:
    - Excellent reasoning
    - Strong at following instructions
    - Good context handling
    - Apache 2.0 license

  ollama_commands:
    pull: ollama pull mistral:7b
    run: ollama run mistral:7b
```

#### CodeLlama (Meta)

```yaml
codellama:
  versions:
    - name: codellama:7b
      parameters: 7B
      size: 3.8GB
      context: 16K
      specialization: code

    - name: codellama:13b
      parameters: 13B
      size: 7.4GB
      context: 16K
      specialization: code

    - name: codellama:34b
      parameters: 34B
      size: 19GB
      context: 16K
      specialization: code

  use_cases:
    - Code generation
    - Code explanation
    - Bug fixing
    - Code review
    - Refactoring

  languages:
    excellent:
      - Python
      - JavaScript/TypeScript
      - Java
      - C/C++
      - Go
      - Rust
    good:
      - Ruby
      - PHP
      - Swift
      - Kotlin

  ollama_commands:
    pull: ollama pull codellama:7b
    run: ollama run codellama:7b "Write a Python function to..."
```

#### DeepSeek Coder

```yaml
deepseek-coder:
  versions:
    - name: deepseek-coder:6.7b
      parameters: 6.7B
      size: 3.8GB
      context: 16K

    - name: deepseek-coder:33b
      parameters: 33B
      size: 19GB
      context: 16K

  use_cases:
    - Code completion
    - Multi-file understanding
    - Complex algorithms
    - Repository-level tasks

  benchmark_scores:
    humaneval: 73.8%  # 6.7b
    mbpp: 65.4%

  ollama_commands:
    pull: ollama pull deepseek-coder:6.7b
```

#### Phi-3 (Microsoft)

```yaml
phi3:
  versions:
    - name: phi3:mini
      parameters: 3.8B
      size: 2.3GB
      context: 128K

    - name: phi3:small
      parameters: 7B
      size: 4.0GB
      context: 128K

    - name: phi3:medium
      parameters: 14B
      size: 8.0GB
      context: 128K

  use_cases:
    - Reasoning tasks
    - Math problems
    - Logical inference
    - Efficient inference

  strengths:
    - Excellent reasoning per parameter
    - Long context (128K)
    - MIT license
    - Efficient

  ollama_commands:
    pull: ollama pull phi3:mini
```

#### Qwen2 (Alibaba)

```yaml
qwen2:
  versions:
    - name: qwen2:0.5b
      parameters: 0.5B
      size: 395MB
      context: 32K
      note: "Smallest capable model"

    - name: qwen2:1.5b
      parameters: 1.5B
      size: 934MB
      context: 32K

    - name: qwen2:7b
      parameters: 7B
      size: 4.4GB
      context: 128K

    - name: qwen2:72b
      parameters: 72B
      size: 41GB
      context: 128K
      note: "Requires high-end GPU"

  use_cases:
    - Multilingual (especially Chinese)
    - General tasks
    - Code generation
    - Math

  ollama_commands:
    pull: ollama pull qwen2:0.5b  # For Pi
    pull: ollama pull qwen2:7b    # For desktop
```

#### LLaVA (Vision)

```yaml
llava:
  versions:
    - name: llava:7b
      parameters: 7B
      size: 4.7GB
      context: 4K
      vision: true

    - name: llava:13b
      parameters: 13B
      size: 8.0GB
      context: 4K
      vision: true

  use_cases:
    - Image description
    - Visual Q&A
    - Document analysis
    - Screenshot understanding

  example:
    command: ollama run llava:7b "Describe this image"
    input: /path/to/image.png

  ollama_commands:
    pull: ollama pull llava:7b
```

---

## Cloud Models

### Anthropic Claude

```yaml
anthropic:
  models:
    - name: claude-opus-4-5
      id: claude-opus-4-5-20251101
      context: 200K
      pricing:
        input: $15/M tokens
        output: $75/M tokens
      strengths:
        - Best reasoning
        - Complex analysis
        - Research tasks
        - Nuanced writing

    - name: claude-sonnet-4-5
      id: claude-sonnet-4-5-20250929
      context: 200K
      pricing:
        input: $3/M tokens
        output: $15/M tokens
      strengths:
        - Excellent coding
        - Fast responses
        - Great balance
        - Most popular

    - name: claude-3-haiku
      id: claude-3-haiku-20240307
      context: 200K
      pricing:
        input: $0.25/M tokens
        output: $1.25/M tokens
      strengths:
        - Very fast
        - Cost effective
        - Simple tasks
        - High throughput

  features:
    - Vision (all models)
    - Tool use
    - JSON mode
    - Extended thinking (opus)

  api_example:
    python: |
      from anthropic import Anthropic
      client = Anthropic()
      message = client.messages.create(
          model="claude-sonnet-4-5-20250929",
          max_tokens=1024,
          messages=[{"role": "user", "content": "Hello!"}]
      )
```

### OpenAI

```yaml
openai:
  models:
    - name: gpt-4o
      context: 128K
      pricing:
        input: $2.50/M tokens
        output: $10/M tokens
      strengths:
        - Fast
        - Good vision
        - Function calling
        - Reliable

    - name: gpt-4o-mini
      context: 128K
      pricing:
        input: $0.15/M tokens
        output: $0.60/M tokens
      strengths:
        - Very cheap
        - Fast
        - Good for simple tasks

    - name: o1
      context: 200K
      pricing:
        input: $15/M tokens
        output: $60/M tokens
      strengths:
        - Deep reasoning
        - Complex problems
        - Math/science

    - name: o1-mini
      context: 128K
      pricing:
        input: $3/M tokens
        output: $12/M tokens
      strengths:
        - Reasoning
        - More affordable

  api_example:
    python: |
      from openai import OpenAI
      client = OpenAI()
      response = client.chat.completions.create(
          model="gpt-4o",
          messages=[{"role": "user", "content": "Hello!"}]
      )
```

### Google Gemini

```yaml
google:
  models:
    - name: gemini-2.0-flash
      context: 1M
      pricing:
        input: $0.075/M tokens
        output: $0.30/M tokens
      strengths:
        - Huge context (1M)
        - Very fast
        - Multimodal
        - Code execution

    - name: gemini-1.5-pro
      context: 2M
      pricing:
        input: $1.25/M tokens
        output: $5/M tokens
      strengths:
        - Largest context (2M)
        - Great for documents
        - Video understanding

  api_example:
    python: |
      import google.generativeai as genai
      model = genai.GenerativeModel("gemini-2.0-flash")
      response = model.generate_content("Hello!")
```

---

## Embedding Models

### Local Embeddings

```yaml
local_embeddings:
  - name: nomic-embed-text
    dimensions: 768
    size: 274MB
    performance: excellent
    ollama: ollama pull nomic-embed-text

  - name: mxbai-embed-large
    dimensions: 1024
    size: 670MB
    performance: very good
    ollama: ollama pull mxbai-embed-large

  - name: all-minilm
    dimensions: 384
    size: 45MB
    performance: good
    note: "Very small, fast"
    ollama: ollama pull all-minilm

usage_example:
  python: |
    import ollama
    response = ollama.embeddings(
        model="nomic-embed-text",
        prompt="Your text here"
    )
    embedding = response["embedding"]  # 768-dim vector
```

### Cloud Embeddings

```yaml
cloud_embeddings:
  openai:
    - name: text-embedding-3-small
      dimensions: 1536
      pricing: $0.02/M tokens
      performance: good

    - name: text-embedding-3-large
      dimensions: 3072
      pricing: $0.13/M tokens
      performance: excellent

  cohere:
    - name: embed-english-v3.0
      dimensions: 1024
      pricing: $0.10/M tokens

  voyageai:
    - name: voyage-large-2
      dimensions: 1024
      pricing: $0.12/M tokens
      note: "Great for code"
```

---

## Specialized Models

### Code Models

| Model | Size | Best For | License |
|-------|------|----------|---------|
| codellama:7b | 3.8GB | General coding | Llama 2 |
| codellama:34b | 19GB | Complex code | Llama 2 |
| deepseek-coder:6.7b | 3.8GB | Multi-file | MIT |
| starcoder2:7b | 4GB | Code completion | BigCode |
| codegemma:7b | 5GB | Code + chat | Gemma |

### Math Models

| Model | Size | Capability |
|-------|------|------------|
| wizardmath:7b | 4GB | Math reasoning |
| mathstral:7b | 4GB | Advanced math |
| deepseek-math:7b | 4GB | Math problems |

### Vision Models

| Model | Size | Capability |
|-------|------|------------|
| llava:7b | 4.7GB | Image understanding |
| llava:13b | 8GB | Better vision |
| bakllava:7b | 4.7GB | Better at OCR |
| moondream:1.8b | 1.7GB | Tiny vision model |

### Uncensored Models

| Model | Size | Note |
|-------|------|------|
| dolphin-mistral:7b | 4.1GB | Uncensored Mistral |
| nous-hermes:7b | 4.1GB | Open instruction |
| openhermes:7b | 4.1GB | Community fine-tune |

---

## Model Selection Guide

### By Hardware

```yaml
hardware_recommendations:
  raspberry_pi_4gb:
    primary: llama3.2:1b
    backup: qwen2:0.5b
    embedding: all-minilm
    notes: "Use swap, expect ~10 tok/s"

  raspberry_pi_8gb:
    primary: llama3.2:1b
    secondary: phi3:mini
    embedding: nomic-embed-text
    notes: "Can run 3B models slowly"

  macbook_air_m1_8gb:
    primary: llama3.2:3b
    secondary: mistral:7b (slow)
    code: codellama:7b
    embedding: nomic-embed-text

  macbook_pro_m1_16gb:
    primary: mistral:7b
    code: codellama:13b
    vision: llava:7b
    embedding: mxbai-embed-large

  desktop_rtx3060_12gb:
    primary: mistral:7b
    code: codellama:13b
    secondary: llama3.1:8b
    vision: llava:13b

  server_a100_80gb:
    primary: llama3.1:70b
    code: codellama:34b
    secondary: mixtral:8x7b
    embedding: text-embedding-3-large
```

### By Use Case

```yaml
use_case_recommendations:
  chatbot:
    local_budget: llama3.2:1b
    local_quality: llama3.2:3b
    cloud_budget: claude-3-haiku
    cloud_quality: claude-sonnet-4-5

  code_assistant:
    local_budget: codellama:7b
    local_quality: deepseek-coder:33b
    cloud_budget: gpt-4o-mini
    cloud_quality: claude-sonnet-4-5

  document_analysis:
    local: mistral:7b
    cloud_budget: gemini-2.0-flash
    cloud_quality: gemini-1.5-pro

  research:
    local: mixtral:8x7b
    cloud: claude-opus-4-5

  creative_writing:
    local: llama3.1:8b
    cloud: claude-sonnet-4-5

  customer_support:
    local: llama3.2:3b
    cloud: gpt-4o-mini

  semantic_search:
    local: nomic-embed-text
    cloud: text-embedding-3-small
```

### Decision Tree

```
Need AI model?
├── Privacy critical? → Local models only
│   ├── Edge device (Pi)? → llama3.2:1b
│   ├── Laptop? → llama3.2:3b or mistral:7b
│   └── GPU server? → llama3.1:70b
│
├── Cost sensitive?
│   ├── Free required? → Local models
│   └── Budget limited? → gpt-4o-mini or claude-3-haiku
│
├── Task complexity?
│   ├── Simple Q&A → llama3.2:1b or gpt-4o-mini
│   ├── Moderate → llama3.2:3b or claude-sonnet-4-5
│   └── Complex reasoning → claude-opus-4-5 or o1
│
└── Specialized task?
    ├── Code → codellama or claude-sonnet-4-5
    ├── Vision → llava or gpt-4o
    ├── Long docs → gemini-1.5-pro (2M context)
    └── Math → mathstral or o1
```

---

## Performance Benchmarks

### Local Model Speed

```
Tokens per second (M1 MacBook Pro 16GB):

Model                  │ Prompt t/s │ Gen t/s │
───────────────────────┼────────────┼─────────┤
qwen2:0.5b             │    180     │   95    │
llama3.2:1b            │    120     │   65    │
phi3:mini              │     85     │   45    │
llama3.2:3b            │     60     │   32    │
mistral:7b             │     35     │   18    │
codellama:7b           │     35     │   18    │
llama3.1:8b            │     28     │   15    │
llava:7b               │     30     │   16    │
mixtral:8x7b           │     12     │    8    │
llama3.1:70b           │      4     │    3    │
```

### Raspberry Pi 4 (8GB)

```
Model                  │ Prompt t/s │ Gen t/s │ Notes
───────────────────────┼────────────┼─────────┼──────────
qwen2:0.5b             │     45     │   25    │ Usable
llama3.2:1b            │     25     │   12    │ Primary
phi3:mini              │     15     │    8    │ Slow
llama3.2:3b            │      8     │    4    │ Very slow
mistral:7b             │      -     │    -    │ OOM
```

### Quality Benchmarks

```
MMLU Scores (General Knowledge):

claude-opus-4-5        ████████████████████████████░░ 88.7%
gpt-4o                 ███████████████████████████░░░ 87.2%
claude-sonnet-4-5      ██████████████████████████░░░░ 85.5%
gemini-1.5-pro         █████████████████████████░░░░░ 83.7%
llama3.1:70b           ████████████████████████░░░░░░ 82.0%
mixtral:8x7b           ██████████████████████░░░░░░░░ 74.4%
mistral:7b             █████████████████████░░░░░░░░░ 71.8%
llama3.2:3b            ███████████████░░░░░░░░░░░░░░░ 58.2%
llama3.2:1b            █████████████░░░░░░░░░░░░░░░░░ 49.3%


HumanEval (Code):

claude-sonnet-4-5      ████████████████████████████░░ 92.0%
gpt-4o                 ███████████████████████████░░░ 90.2%
deepseek-coder:33b     █████████████████████████░░░░░ 83.5%
codellama:34b          ████████████████████████░░░░░░ 81.0%
codellama:7b           ██████████████████████░░░░░░░░ 72.8%
mistral:7b             █████████████████░░░░░░░░░░░░░ 55.3%
```

---

## Cost Analysis

### Monthly Cost Estimates

```yaml
cost_scenarios:
  light_usage:  # 100K tokens/day
    local_only: $0
    hybrid:
      local: 80%
      cloud: 20% (gpt-4o-mini)
      cost: ~$3/month
    cloud_only:
      model: gpt-4o-mini
      cost: ~$15/month

  moderate_usage:  # 1M tokens/day
    local_only: $0 (+ electricity)
    hybrid:
      local: 70%
      cloud: 30% (claude-sonnet-4-5)
      cost: ~$150/month
    cloud_only:
      model: claude-sonnet-4-5
      cost: ~$500/month

  heavy_usage:  # 10M tokens/day
    local_only: $0 (+ hardware)
    hybrid:
      local: 90%
      cloud: 10% (complex tasks)
      cost: ~$500/month
    cloud_only:
      model: claude-sonnet-4-5
      cost: ~$5,000/month

hardware_roi:
  raspberry_pi_4:
    cost: $75
    monthly_equivalent: ~$50 API
    payback: 1.5 months

  mac_mini_m2:
    cost: $600
    monthly_equivalent: ~$500 API
    payback: 1.2 months

  rtx_4090_server:
    cost: $3000
    monthly_equivalent: ~$2000 API
    payback: 1.5 months
```

### Cost Per Task

```yaml
task_costs:
  simple_query:
    local: $0
    gpt-4o-mini: $0.0003
    claude-haiku: $0.0005

  code_review_1000_lines:
    local: $0
    gpt-4o: $0.05
    claude-sonnet: $0.08

  document_summary_10_pages:
    local: $0
    gemini-flash: $0.02
    claude-sonnet: $0.15

  complex_analysis:
    local: $0 (slower)
    claude-opus: $0.50
    o1: $0.75
```

---

## Integration

### BlackRoad Model Configuration

```yaml
# config/models.yaml
models:
  # Default model routing
  default:
    chat: llama3.2:3b
    code: codellama:7b
    reasoning: mistral:7b
    embedding: nomic-embed-text

  # Agent-specific models
  agents:
    LUCIDIA:
      primary: mistral:7b
      fallback: claude-sonnet-4-5
      reasoning: claude-opus-4-5

    ALICE:
      primary: codellama:7b
      fallback: deepseek-coder:6.7b

    OCTAVIA:
      primary: llama3.2:3b
      fallback: gpt-4o-mini

    PRISM:
      primary: llama3.2:1b  # Fast analytics
      embedding: nomic-embed-text

    ECHO:
      primary: phi3:mini  # Memory summarization
      embedding: nomic-embed-text

    CIPHER:
      primary: llama3.2:1b  # Security scanning
      fallback: mistral:7b

  # Fallback chain
  fallback_chain:
    - local: llama3.2:3b
    - local: mistral:7b
    - cloud: claude-sonnet-4-5
    - cloud: gpt-4o

  # Cost limits
  limits:
    daily_cloud_budget: $10
    prefer_local: true
    cloud_threshold: complexity > 0.8
```

### Model Router

```python
# blackroad/inference/router.py
from dataclasses import dataclass
from enum import Enum
from typing import Optional

class TaskComplexity(Enum):
    TRIVIAL = 0.1
    SIMPLE = 0.3
    MODERATE = 0.5
    COMPLEX = 0.7
    EXPERT = 0.9

@dataclass
class ModelSelection:
    model: str
    provider: str  # ollama, anthropic, openai
    reason: str
    estimated_cost: float

class IntelligentModelRouter:
    """Route requests to optimal models."""

    def __init__(self, config: dict):
        self.config = config
        self.daily_spend = 0.0

    def select_model(
        self,
        task_type: str,
        complexity: TaskComplexity,
        agent_id: Optional[str] = None,
        require_local: bool = False
    ) -> ModelSelection:
        """Select best model for task."""

        # Check agent-specific config
        if agent_id and agent_id in self.config["agents"]:
            agent_config = self.config["agents"][agent_id]
            primary = agent_config.get("primary")

            if self._can_handle(primary, task_type, complexity):
                return ModelSelection(
                    model=primary,
                    provider="ollama",
                    reason="Agent primary model",
                    estimated_cost=0.0
                )

        # Check budget
        if self.daily_spend >= self.config["limits"]["daily_cloud_budget"]:
            require_local = True

        # Complexity-based selection
        if complexity.value <= 0.3:
            return self._select_light_model(task_type)
        elif complexity.value <= 0.6:
            return self._select_medium_model(task_type, require_local)
        else:
            return self._select_heavy_model(task_type, require_local)

    def _select_light_model(self, task_type: str) -> ModelSelection:
        """Select model for light tasks."""
        if task_type == "code":
            model = "codellama:7b"
        else:
            model = "llama3.2:1b"

        return ModelSelection(
            model=model,
            provider="ollama",
            reason="Light task, local model sufficient",
            estimated_cost=0.0
        )

    def _select_medium_model(
        self,
        task_type: str,
        require_local: bool
    ) -> ModelSelection:
        """Select model for medium tasks."""
        if require_local:
            model = "mistral:7b" if task_type != "code" else "codellama:7b"
            provider = "ollama"
            cost = 0.0
        else:
            model = "claude-sonnet-4-5"
            provider = "anthropic"
            cost = 0.05  # Estimate

        return ModelSelection(
            model=model,
            provider=provider,
            reason="Medium complexity task",
            estimated_cost=cost
        )

    def _select_heavy_model(
        self,
        task_type: str,
        require_local: bool
    ) -> ModelSelection:
        """Select model for heavy tasks."""
        if require_local:
            model = "mixtral:8x7b" if self._model_available("mixtral:8x7b") else "mistral:7b"
            provider = "ollama"
            cost = 0.0
        else:
            model = "claude-opus-4-5"
            provider = "anthropic"
            cost = 0.50  # Estimate

        return ModelSelection(
            model=model,
            provider=provider,
            reason="Complex task requiring advanced reasoning",
            estimated_cost=cost
        )
```

---

## Quick Reference

### Ollama Commands

```bash
# Pull models
ollama pull llama3.2:3b
ollama pull mistral:7b
ollama pull codellama:7b

# Run interactive
ollama run llama3.2:3b

# List models
ollama list

# Remove model
ollama rm <model>

# Model info
ollama show <model>
```

### Model Quick Picks

| Need | Model | Why |
|------|-------|-----|
| Fastest | qwen2:0.5b | Tiny but capable |
| Best free | mistral:7b | Great quality |
| Best code | codellama:7b | Specialized |
| Best vision | llava:7b | Multimodal |
| Best overall | claude-sonnet-4-5 | Balance |
| Best reasoning | claude-opus-4-5 | Deep thought |

---

## Related Documentation

- [OLLAMA.md](OLLAMA.md) - Local inference setup
- [MCP.md](MCP.md) - Model Context Protocol
- [PERFORMANCE.md](PERFORMANCE.md) - Optimization
- [AGENTS.md](AGENTS.md) - Agent configuration
- [INFRASTRUCTURE.md](INFRASTRUCTURE.md) - Hardware setup

---

*Your AI. Your Hardware. Your Rules.*
