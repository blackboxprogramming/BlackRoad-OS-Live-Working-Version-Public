# 🚀 BlackRoad AI - Complete Deployment Guide

**From zero to fully operational AI cluster in minutes**

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Manual Deployment](#manual-deployment)
4. [Using the AI](#using-the-ai)
5. [Integration Examples](#integration-examples)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### Hardware
- ✅ 4 Raspberry Pis (lucidia, aria, alice, octavia)
- ✅ SSH access to all Pis
- ✅ Docker installed on all Pis
- ✅ Local machine (Mac/Linux) for API Gateway

### Software
- ✅ Docker & Docker Compose
- ✅ Git
- ✅ Bash
- ✅ curl

### Network
- ✅ All Pis on same network
- ✅ SSH keys configured
- ✅ Internet access for model downloads

---

## Quick Start

### 1. Clone the Infrastructure
```bash
cd ~
git clone https://github.com/BlackRoad-AI/blackroad-ai-qwen blackroad-ai-models/qwen
git clone https://github.com/BlackRoad-AI/blackroad-ai-ollama blackroad-ai-models/ollama
git clone https://github.com/BlackRoad-AI/blackroad-ai-api-gateway blackroad-ai-models/api-gateway
```

### 2. Deploy Everything
```bash
cd ~/blackroad-ai-models
./deploy-full-cluster.sh
```

**This will:**
- Build Docker images for Qwen and Ollama
- Deploy to all 4 Pis in parallel
- Start API Gateway locally
- Run health checks
- Log to [MEMORY] system

**Expected time:** ~10-15 minutes (depending on internet speed for model downloads)

### 3. Test It
```bash
# Check cluster health
curl http://localhost:7000/health

# Chat with AI
curl -X POST http://localhost:7000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain quantum entanglement in simple terms",
    "model": "auto"
  }'
```

---

## Manual Deployment

### Step 1: Build Qwen Container
```bash
cd ~/blackroad-ai-models/qwen
docker build -t blackroad-ai-qwen:latest .
```

### Step 2: Build Ollama Container
```bash
cd ~/blackroad-ai-models/ollama
docker build -t blackroad-ai-qwen:latest .
```

### Step 3: Deploy to Lucidia (Example)
```bash
# Save and transfer Qwen image
docker save blackroad-ai-qwen:latest | gzip | \
  ssh pi@192.168.4.38 "gunzip | docker load"

# Transfer docker-compose
scp docker-compose.yml pi@192.168.4.38:~/blackroad-ai/qwen/

# Create network and start
ssh pi@192.168.4.38 "docker network create blackroad-ai-network || true"
ssh pi@192.168.4.38 "cd ~/blackroad-ai/qwen && docker-compose up -d"

# Repeat for Ollama and other Pis
```

### Step 4: Start API Gateway
```bash
cd ~/blackroad-ai-models/api-gateway
docker network create blackroad-ai-network || true
docker-compose up -d
```

---

## Using the AI

### JavaScript/Node.js
```javascript
const BlackRoadAI = require('./blackroad-ai-client.js');

const ai = new BlackRoadAI({
    gatewayUrl: 'http://localhost:7000',
    sessionId: 'user-123'
});

// Simple chat
const response = await ai.chat("What is BlackRoad?");
console.log(response.response);

// Advanced usage
const response = await ai.chat(
    "Explain the Golden Ratio in architecture",
    {
        model: 'qwen',
        maxTokens: 1000,
        temperature: 0.8,
        useMemory: true,
        enableActions: true
    }
);

console.log(`Response: ${response.response}`);
console.log(`Model: ${response.model_used}`);
console.log(`Node: ${response.node_used}`);
console.log(`Latency: ${response.latency_ms}ms`);
```

### Python
```python
import asyncio
from blackroad_ai_client import BlackRoadAI

async def main():
    async with BlackRoadAI(gateway_url="http://localhost:7000") as ai:
        # Simple chat
        response = await ai.chat("What is BlackRoad?")
        print(response['response'])

        # Advanced usage
        response = await ai.chat(
            "Explain the Golden Ratio in architecture",
            model="qwen",
            max_tokens=1000,
            temperature=0.8,
            use_memory=True,
            enable_actions=True
        )

        print(f"Response: {response['response']}")
        print(f"Model: {response['model_used']}")
        print(f"Node: {response['node_used']}")
        print(f"Latency: {response['latency_ms']}ms")

asyncio.run(main())
```

### cURL
```bash
# Basic chat
curl -X POST http://localhost:7000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello AI!",
    "model": "auto"
  }'

# Advanced chat
curl -X POST http://localhost:7000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain quantum computing",
    "model": "qwen",
    "max_tokens": 1000,
    "temperature": 0.8,
    "use_memory": true,
    "enable_actions": true,
    "session_id": "user-123",
    "prefer_node": "lucidia"
  }'

# Check cluster health
curl http://localhost:7000/health | jq

# List available models
curl http://localhost:7000/models | jq
```

---

## Integration Examples

### React/Next.js
```typescript
'use client';

import { useState } from 'react';
import BlackRoadAI from '@/lib/blackroad-ai-client';

export default function ChatPage() {
    const [ai] = useState(() => new BlackRoadAI());
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await ai.chat(message);
            setResponse(result.response);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container">
            <form onSubmit={handleSubmit}>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask anything..."
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Thinking...' : 'Send'}
                </button>
            </form>
            {response && (
                <div className="response">{response}</div>
            )}
        </div>
    );
}
```

### FastAPI Backend
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from blackroad_ai_client import BlackRoadAI

app = FastAPI()
ai = BlackRoadAI(gateway_url="http://localhost:7000")

class ChatRequest(BaseModel):
    message: str
    model: str = "auto"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        response = await ai.chat(
            request.message,
            model=request.model
        )
        return {
            "success": True,
            "response": response['response'],
            "model": response['model_used'],
            "latency_ms": response['latency_ms']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    return await ai.health()
```

### Express.js Backend
```javascript
const express = require('express');
const BlackRoadAI = require('./blackroad-ai-client');

const app = express();
const ai = new BlackRoadAI({ gatewayUrl: 'http://localhost:7000' });

app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const response = await ai.chat(req.body.message, {
            model: req.body.model || 'auto'
        });
        res.json({
            success: true,
            response: response.response,
            model: response.model_used,
            latency_ms: response.latency_ms
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/health', async (req, res) => {
    const health = await ai.health();
    res.json(health);
});

app.listen(3000);
```

---

## Troubleshooting

### Issue: Container won't start
```bash
# Check logs
docker logs blackroad-ai-qwen
docker logs blackroad-ai-ollama

# Common causes:
# - Port already in use
# - Insufficient memory
# - Model download failed
```

### Issue: Health check fails
```bash
# Check if container is running
docker ps | grep blackroad-ai

# Test directly (bypass gateway)
curl http://192.168.4.38:8000/health  # Qwen on lucidia
curl http://192.168.4.38:8001/health  # Ollama on lucidia

# Check container logs
ssh pi@192.168.4.38 "docker logs blackroad-ai-qwen"
```

### Issue: Slow responses
```bash
# Check which node is being used
# Response includes "node_used" field

# Prefer faster node
curl -X POST http://localhost:7000/chat \
  -d '{"message": "test", "prefer_node": "lucidia"}'

# Check cluster load
curl http://localhost:7000/health | jq '.nodes'
```

### Issue: [MEMORY] integration not working
```bash
# Verify memory system is accessible
~/memory-system.sh summary

# Check container has access to host home directory
docker exec blackroad-ai-qwen ls /host-home

# Verify memory script exists
ls -la ~/memory-system.sh
```

---

## Advanced Configuration

### Custom Model Selection
```javascript
// Use specific Ollama model
const response = await ai.chat("Code example", {
    model: 'ollama',
    specificModel: 'codellama:7b'
});

// Prefer specific node
const response = await ai.chat("Fast response", {
    preferNode: 'lucidia'  // Use fastest Pi
});
```

### Scaling Up
```bash
# Add more Pis to cluster
# Edit api-gateway/src/main.py

CLUSTER_NODES = [
    # ... existing nodes ...
    ClusterNode(name="newpi", ip="192.168.4.XX", port=8000, model_type="qwen"),
    ClusterNode(name="newpi-ollama", ip="192.168.4.XX", port=8001, model_type="ollama"),
]

# Rebuild and restart gateway
cd api-gateway
docker-compose down && docker-compose up -d
```

### Adding Custom Models
```bash
# SSH to any Pi
ssh pi@192.168.4.38

# Pull new model in Ollama
docker exec blackroad-ai-ollama ollama pull <model-name>

# Examples:
docker exec blackroad-ai-ollama ollama pull codellama:7b
docker exec blackroad-ai-ollama ollama pull phi:2.7b
docker exec blackroad-ai-ollama ollama pull neural-chat:7b
```

---

## Monitoring

### Real-time Logs
```bash
# API Gateway
docker logs -f blackroad-ai-gateway

# Qwen on lucidia
ssh pi@192.168.4.38 "docker logs -f blackroad-ai-qwen"

# Ollama on lucidia
ssh pi@192.168.4.38 "docker logs -f blackroad-ai-ollama"
```

### Health Dashboard
```bash
# Quick health check
watch -n 5 'curl -s http://localhost:7000/health | jq'

# All nodes
for ip in 192.168.4.38 192.168.4.64 192.168.4.49 192.168.4.74; do
    echo "=== Pi at $ip ==="
    curl -s http://$ip:8000/health | jq -r '.status'
    curl -s http://$ip:8001/health | jq -r '.status'
done
```

---

## 🎯 Next Steps

1. ✅ Deploy cluster with `./deploy-full-cluster.sh`
2. ⏳ Integrate into your apps using client libraries
3. ⏳ Deploy to Cloudflare Workers AI (edge deployment)
4. ⏳ Build monitoring dashboard
5. ⏳ Add more models (Gemma, CodeLlama, etc.)

---

🌌 **Built with the BlackRoad Vision** - Quantum principles meet distributed AI
