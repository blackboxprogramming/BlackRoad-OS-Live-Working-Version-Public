# 🤖 BlackRoad AI - Complete Infrastructure

**Proprietary AI model deployment across distributed infrastructure**

## 🎯 Overview

BlackRoad AI is a comprehensive AI infrastructure built on open-source foundations with proprietary enhancements. It deploys cutting-edge AI models across a distributed Raspberry Pi cluster with full [MEMORY] integration, load balancing, and unified API access.

### 🏗️ Architecture

```
                    ┌────────────────────────────┐
                    │   API Gateway :7000        │
                    │   • Load Balancing         │
        Apps ──────▶│   • Auto-failover          │
                    │   • [MEMORY] Integration   │
                    └────────────┬───────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
         ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐
         │ Lucidia  │      │   Aria   │      │  Alice   │
         ├──────────┤      ├──────────┤      ├──────────┤
         │ Qwen:8000│      │ Qwen:8000│      │ Qwen:8000│
         │Ollama:8001│      │Ollama:8001│      │Ollama:8001│
         └──────────┘      └──────────┘      └──────────┘
```

## 📦 Repositories

All code is in the **BlackRoad-AI** GitHub organization:

### Core Infrastructure
- **[blackroad-ai-qwen](https://github.com/BlackRoad-AI/blackroad-ai-qwen)** - Qwen2.5 deployment (Apache 2.0)
- **[blackroad-ai-ollama](https://github.com/BlackRoad-AI/blackroad-ai-ollama)** - Ollama multi-model runtime (MIT)
- **[blackroad-ai-api-gateway](https://github.com/BlackRoad-AI/blackroad-ai-api-gateway)** - Unified API gateway
- **[blackroad-ai-deepseek](https://github.com/BlackRoad-AI/blackroad-ai-deepseek)** - DeepSeek-V3 (future)
- **[blackroad-ai-cluster](https://github.com/BlackRoad-AI/blackroad-ai-cluster)** - Cluster orchestration (future)
- **[blackroad-ai-memory-bridge](https://github.com/BlackRoad-AI/blackroad-ai-memory-bridge)** - [MEMORY] integration (future)

## 🚀 Quick Start

### 1. Clone All Repos
```bash
git clone https://github.com/BlackRoad-AI/blackroad-ai-qwen
git clone https://github.com/BlackRoad-AI/blackroad-ai-ollama
git clone https://github.com/BlackRoad-AI/blackroad-ai-api-gateway
```

### 2. Deploy Full Cluster
```bash
./deploy-full-cluster.sh
```

This deploys:
- Qwen2.5 to all Pis (port 8000)
- Ollama to all Pis (port 8001)
- API Gateway locally (port 7000)

### 3. Use the AI
```bash
curl -X POST http://localhost:7000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain quantum computing", "model": "auto"}'
```

## 🧠 Models

### Currently Deployed
- **Qwen2.5-7B** (Apache 2.0) - Primary language model
- **DeepSeek-R1-7B** - Advanced reasoning
- **Llama3.2-3B** - Meta's compact model
- **Mistral-7B** - Mistral AI model

### Coming Soon
- **DeepSeek-V3** (MIT + Custom)
- **Gemma 2** (Under review)
- **CodeLlama** - Code generation
- **Neural Chat** - Intel's model

## 🌐 Cluster Infrastructure

### Raspberry Pi Nodes
- **lucidia** (192.168.4.38)
- **aria** (192.168.4.64)
- **alice** (192.168.4.49)
- **octavia** (192.168.4.74)

Each node runs:
- Qwen2.5 server (port 8000)
- Ollama runtime (port 8001)

Total: **8 model instances** across **4 Pis**

### API Gateway
- Intelligent routing
- Load balancing
- Automatic failover
- Health monitoring
- [MEMORY] broadcasting

## 💻 Client Libraries

### JavaScript/TypeScript
```javascript
import BlackRoadAI from './blackroad-ai-client.js';

const ai = new BlackRoadAI();
const response = await ai.chat("Hello!");
console.log(response.response);
```

### Python
```python
from blackroad_ai_client import BlackRoadAI

async with BlackRoadAI() as ai:
    response = await ai.chat("Hello!")
    print(response['response'])
```

## 🧠 [MEMORY] Integration

All models integrate with BlackRoad's memory system:
- ✅ Conversation history
- ✅ Cross-model context sharing
- ✅ Collaboration with Claude instances
- ✅ Real-time coordination

## 🎨 Features

- 🗣️ **Natural Language** - Advanced language understanding
- ⚡ **Action Execution** - Execute bash commands, API calls
- 🎨 **Emoji Support** - Contextual emoji enhancement
- 🔄 **Load Balancing** - Distribute across cluster
- 📡 **Unified API** - Single endpoint for all models
- 🔐 **PS-SHA-∞** - Verification system
- 🌈 **BlackRoad Design** - Official brand colors & spacing

## 📊 Monitoring

```bash
# Cluster health
curl http://localhost:7000/health

# Available models
curl http://localhost:7000/models

# Node-specific check
curl http://192.168.4.38:8000/health
```

## 🔌 Integration Examples

### Next.js
```typescript
'use client';
import { BlackRoadAI } from '@/lib/blackroad-ai';

export default function Chat() {
  const ai = new BlackRoadAI();

  const handleSubmit = async (message: string) => {
    const response = await ai.chat(message);
    return response.response;
  };

  return <ChatUI onSubmit={handleSubmit} />;
}
```

### FastAPI
```python
from fastapi import FastAPI
from blackroad_ai_client import BlackRoadAI

app = FastAPI()
ai = BlackRoadAI()

@app.post("/ask")
async def ask(question: str):
    response = await ai.chat(question)
    return {"answer": response['response']}
```

### Express.js
```javascript
const express = require('express');
const BlackRoadAI = require('./blackroad-ai-client');

const app = express();
const ai = new BlackRoadAI();

app.post('/chat', async (req, res) => {
  const response = await ai.chat(req.body.message);
  res.json(response);
});
```

## 📄 Licenses

- **Qwen2.5**: Apache 2.0
- **Ollama**: MIT
- **DeepSeek**: MIT + Custom Model License
- **BlackRoad Infrastructure**: Proprietary

## 🚦 Deployment Status

✅ Infrastructure repositories created
✅ Docker containers built
✅ [MEMORY] integration complete
✅ API Gateway functional
✅ Client libraries ready
⏳ Cluster deployment (ready to execute)
⏳ Cloudflare Workers AI integration (planned)
⏳ Visual dashboard (planned)

## 🎯 Next Steps

1. Execute `./deploy-full-cluster.sh`
2. Integrate into existing BlackRoad apps
3. Deploy Cloudflare Workers AI
4. Build monitoring dashboard
5. Add more models (Gemma, CodeLlama)

## 🌌 Vision

BlackRoad AI represents the convergence of:
- Open-source AI models
- Distributed computing
- Quantum-inspired architecture
- [MEMORY]-based collaboration
- Beautiful design (Golden Ratio, official colors)

---

🖤🛣️ **Built with the BlackRoad Vision** - Quantum principles meet distributed AI
