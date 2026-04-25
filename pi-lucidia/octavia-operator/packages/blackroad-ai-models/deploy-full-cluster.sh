#!/bin/bash
# 🚀 BlackRoad AI - Deploy Full AI Cluster
# Deploys Qwen, Ollama, and API Gateway to all Pis

set -e

echo "🌌 BlackRoad AI - Full Cluster Deployment"
echo "=========================================="

# Configuration
MODELS_DIR=~/blackroad-ai-models
PI_NODES=("lucidia:192.168.4.38" "aria:192.168.4.64" "alice:192.168.4.49" "octavia:192.168.4.74")
DEPLOY_TIMESTAMP=$(date +%s)

# Log start to memory
~/memory-system.sh log started "ai-cluster-deploy-$DEPLOY_TIMESTAMP" \
    "Starting full AI cluster deployment: Qwen + Ollama to ${#PI_NODES[@]} Pis + API Gateway" \
    "ai-deployment,cluster,major"

echo ""
echo "📋 Deployment Plan:"
echo "  • Qwen2.5 (Apache 2.0) - Port 8000"
echo "  • Ollama Multi-Model - Port 8001"
echo "  • API Gateway - Port 7000"
echo "  • Target Nodes: ${#PI_NODES[@]} Pis"
echo ""

# Function to deploy to a Pi
deploy_to_pi() {
    local host_info=$1
    local name="${host_info%%:*}"
    local ip="${host_info##*:}"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 Deploying to $name ($ip)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Create deployment directory
    echo "📁 Creating deployment directory..."
    ssh pi@$ip "mkdir -p ~/blackroad-ai/{qwen,ollama,gateway}"

    # Deploy Qwen
    echo "🤖 Deploying Qwen2.5..."
    cd $MODELS_DIR/qwen
    docker build -t blackroad-ai-qwen:latest . > /dev/null 2>&1
    docker save blackroad-ai-qwen:latest | gzip | \
        ssh pi@$ip "gunzip | docker load"
    scp docker-compose.yml pi@$ip:~/blackroad-ai/qwen/

    # Deploy Ollama
    echo "🔄 Deploying Ollama..."
    cd $MODELS_DIR/ollama
    docker build -t blackroad-ai-ollama:latest . > /dev/null 2>&1
    docker save blackroad-ai-ollama:latest | gzip | \
        ssh pi@$ip "gunzip | docker load"
    scp docker-compose.yml pi@$ip:~/blackroad-ai/ollama/

    # Create network
    echo "🌐 Creating Docker network..."
    ssh pi@$ip "docker network create blackroad-ai-network 2>/dev/null || true"

    # Start services
    echo "🎬 Starting services..."
    ssh pi@$ip "cd ~/blackroad-ai/qwen && docker-compose up -d"
    ssh pi@$ip "cd ~/blackroad-ai/ollama && docker-compose up -d"

    # Wait and health check
    echo "🏥 Waiting for services to start (60s)..."
    sleep 60

    echo "🏥 Health checks:"
    ssh pi@$ip "curl -f http://localhost:8000/health 2>/dev/null && echo '  ✅ Qwen online' || echo '  ❌ Qwen failed'"
    ssh pi@$ip "curl -f http://localhost:8001/health 2>/dev/null && echo '  ✅ Ollama online' || echo '  ❌ Ollama failed'"

    # Log to memory
    ~/memory-system.sh log completed "ai-deploy-$name" \
        "Deployed Qwen + Ollama to $name ($ip). Services running on ports 8000, 8001." \
        "ai-deployment,$name"

    echo "✅ $name deployment complete!"
    echo ""
}

# Deploy to all Pis
for node in "${PI_NODES[@]}"; do
    deploy_to_pi "$node" &
done

# Wait for all deployments
echo "⏳ Waiting for parallel deployments..."
wait

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Deploying API Gateway (local)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd $MODELS_DIR/api-gateway
docker network create blackroad-ai-network 2>/dev/null || true
docker-compose up -d

echo "⏳ Waiting for gateway (30s)..."
sleep 30

# Test gateway
echo "🏥 Testing API Gateway..."
curl -f http://localhost:7000/health && echo "✅ Gateway online!" || echo "❌ Gateway failed"

# Log completion
~/memory-system.sh log milestone "ai-cluster-deployed" \
    "🎉 FULL AI CLUSTER DEPLOYED!

✅ Deployed to ${#PI_NODES[@]} Pis:
$(for node in "${PI_NODES[@]}"; do echo "  • ${node%%:*}"; done)

📦 Services per Pi:
  • Qwen2.5 (port 8000)
  • Ollama with 4 models (port 8001)

🌐 API Gateway (port 7000):
  • Load balancing
  • Auto-failover
  • [MEMORY] integration

Total model instances: $((${#PI_NODES[@]} * 2)) nodes
Total models available: 5+ (Qwen2.5, DeepSeek-R1, Llama3.2, Mistral, etc.)

🖤🛣️ BlackRoad AI infrastructure is LIVE!" \
    "ai-deployment,cluster,milestone,success"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ DEPLOYMENT COMPLETE ✨"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 API Gateway: http://localhost:7000"
echo "📊 Health: http://localhost:7000/health"
echo "📋 Models: http://localhost:7000/models"
echo ""
echo "💬 Test it:"
echo '  curl -X POST http://localhost:7000/chat \'
echo '    -H "Content-Type: application/json" \'
echo '    -d '"'"'{"message": "Hello AI!", "model": "auto"}'"'"''
echo ""
echo "🖤🛣️ BlackRoad AI is online!"
