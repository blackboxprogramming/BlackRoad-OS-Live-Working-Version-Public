# 🚀 IMPLEMENTATION PLAN: lucidia
## Multi-Model AI Orchestration Layer

**Repo**: `blackboxprogramming/lucidia`
**Purpose**: AI orchestration, multi-model routing, agent intelligence
**Phase**: **Phase 1 (Q3-Q4) → Phase 2 (Expansion)**

---

## PURPOSE

**Lucidia** is the **AI intelligence layer** that:
- Routes requests to multiple AI models (Claude, GPT-4, Llama, Gemini)
- Orchestrates multi-agent conversations
- Manages long-term memory and context
- Provides personas (Cece, Amundson, etc.)
- Tool calling and function execution
- Cost optimization (use cheaper models when appropriate)

**Role in Architecture**: **Layer 4** (Orchestration & Intelligence)

**Domain**: `lucidia.blackroad.systems` (API), `lucidia.earth` (narrative site, Phase 2)

---

## CORE ARCHITECTURE

### 1. Multi-Model Router

```python
# lucidia/router.py
from anthropic import Anthropic
from openai import OpenAI
import requests

class ModelRouter:
    def __init__(self):
        self.claude = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    async def route(self, prompt: str, preferences: dict):
        """Route to best model based on task, cost, latency."""

        # Task classification
        task_type = self.classify_task(prompt)

        # Routing logic
        if task_type == "code":
            return await self.call_claude(prompt, model="claude-sonnet-4")
        elif task_type == "creative":
            return await self.call_openai(prompt, model="gpt-4")
        elif task_type == "fast":
            return await self.call_openai(prompt, model="gpt-3.5-turbo")
        else:
            # Default to Claude
            return await self.call_claude(prompt)

    async def call_claude(self, prompt: str, model: str = "claude-3-5-sonnet-20241022"):
        response = self.claude.messages.create(
            model=model,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text

    async def call_openai(self, prompt: str, model: str = "gpt-4"):
        response = self.openai.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
```

### 2. Multi-Agent Orchestration

```python
# lucidia/orchestrator.py
class AgentOrchestrator:
    def __init__(self):
        self.agents = {
            "cece": Agent(name="Cece", role="OS Architect", model="claude-sonnet-4"),
            "amundson": Agent(name="Amundson", role="Quantum Physicist", model="claude-opus-4"),
            "designer": Agent(name="Designer", role="UI/UX", model="gpt-4"),
        }

    async def orchestrate(self, task: str):
        """Orchestrate multiple agents to complete a complex task."""

        # Step 1: Analyze task
        plan = await self.agents["cece"].plan(task)

        # Step 2: Execute subtasks
        results = []
        for subtask in plan.subtasks:
            agent = self.agents[subtask.agent]
            result = await agent.execute(subtask.description)
            results.append(result)

        # Step 3: Synthesize results
        final = await self.agents["cece"].synthesize(results)
        return final
```

### 3. Long-Term Memory

```python
# lucidia/memory.py
from chromadb import Client

class Memory:
    def __init__(self):
        self.chroma = Client()
        self.collection = self.chroma.create_collection("lucidia_memory")

    async def store(self, text: str, metadata: dict):
        """Store conversation or context."""
        self.collection.add(
            documents=[text],
            metadatas=[metadata],
            ids=[str(uuid.uuid4())]
        )

    async def recall(self, query: str, n_results: int = 5):
        """Retrieve relevant context."""
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results
```

---

## INTEGRATION WITH BLACKROAD OS

### API Endpoints

**In `blackroad-api`** (proxy to Lucidia):
```python
# app/routers/lucidia.py
from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/api/lucidia", tags=["lucidia"])

@router.post("/chat")
async def chat(message: str, model: str = "auto"):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://lucidia.blackroad.systems/chat",
            json={"message": message, "model": model}
        )
        return response.json()

@router.post("/orchestrate")
async def orchestrate(task: str):
    """Multi-agent task orchestration."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://lucidia.blackroad.systems/orchestrate",
            json={"task": task}
        )
        return response.json()
```

### OS App Integration

**Lucidia Core App** (in OS UI):
```javascript
// backend/static/js/apps/lucidia.js
window.Apps.Lucidia = {
    init() {
        this.messages = [];
    },

    async sendMessage(message) {
        const response = await fetch('/api/lucidia/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, model: 'auto' })
        });
        const data = await response.json();
        this.messages.push({ role: 'user', content: message });
        this.messages.push({ role: 'assistant', content: data.response });
        this.render();
    },

    render() {
        return `
            <div class="lucidia-chat">
                ${this.messages.map(msg => `
                    <div class="message ${msg.role}">
                        <strong>${msg.role}:</strong> ${msg.content}
                    </div>
                `).join('')}
                <input type="text" id="lucidia-input" placeholder="Ask Lucidia...">
                <button onclick="Apps.Lucidia.sendMessage(document.getElementById('lucidia-input').value)">Send</button>
            </div>
        `;
    }
};
```

---

## REPOSITORY STRUCTURE

```
lucidia/
├── lucidia/
│   ├── __init__.py
│   ├── router.py          # Multi-model routing
│   ├── orchestrator.py    # Multi-agent orchestration
│   ├── memory.py          # Long-term memory (ChromaDB)
│   ├── personas.py        # Cece, Amundson, etc.
│   ├── tools.py           # Function calling
│   └── config.py          # Model configs, API keys
├── api/
│   └── main.py            # FastAPI service
├── tests/
│   ├── test_router.py
│   ├── test_orchestrator.py
│   └── test_memory.py
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## TECHNOLOGY STACK

**Core**:
- Python 3.11+
- FastAPI (API service)
- Anthropic SDK (Claude)
- OpenAI SDK (GPT-4)
- ChromaDB (vector memory)

**Optional**:
- LangChain (agent framework)
- LlamaIndex (context management)
- Replicate (open-source models)

---

## PHASE 1 MILESTONES

**Month 6-7**: Basic multi-model routing
**Month 8-9**: Multi-agent orchestration
**Month 10-11**: Long-term memory integration
**Month 12**: Production deployment, OS integration

**Success Criteria**:
- ✅ 3+ models supported (Claude, GPT-4, Llama)
- ✅ <2s average response time
- ✅ 95% user satisfaction
- ✅ 10+ personas available

---

## PHASE 2 EXPANSION

**lucidia.earth** (Narrative Site):
- Public-facing AI experiences
- Interactive stories
- AI art gallery
- Community showcase

**Advanced Features**:
- Fine-tuned models (custom Lucidia models)
- Multimodal (image, audio, video)
- Real-time collaboration (multiple users + AI)

---

## CLOUDFLARE & DOMAINS

**DNS Records**:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | lucidia.blackroad | `lucidia-api.up.railway.app` | ✅ |
| CNAME | lucidia.earth | `lucidia-narrative.vercel.app` | ✅ |

---

## COST OPTIMIZATION

**Model Cost Comparison**:
- Claude Sonnet 4: $3 / 1M input tokens
- GPT-4: $10 / 1M input tokens
- GPT-3.5 Turbo: $0.50 / 1M input tokens
- Llama 3 (open-source): Free (hosting cost only)

**Strategy**:
- Use GPT-3.5 for simple queries (classification, summarization)
- Use Claude Sonnet for complex reasoning (code, analysis)
- Use GPT-4 for creative tasks (copywriting, brainstorming)
- Cache common queries in Redis

**Projected Savings**: 60% vs. using GPT-4 for everything

---

**Last Updated**: 2025-11-18
