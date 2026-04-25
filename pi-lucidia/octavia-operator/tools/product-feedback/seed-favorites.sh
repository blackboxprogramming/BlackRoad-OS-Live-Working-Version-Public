#!/bin/zsh
# Seed the product feedback database with known favorites across orgs
# Run once to bootstrap: ./seed-favorites.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Seeding product feedback database with known favorites..."

seed() {
  "$SCRIPT_DIR/br-product-feedback.sh" quick "$1" "$2" "$3" "$4" "$5"
}

# BlackRoad-OS-Inc
seed "blackroad-operator"    "CLI tooling, node bootstrap, operational control"               tool   "cli,ops,core"       "system"
seed "blackroad-core"        "Core orchestration layer and runtime engine"                    product "core,runtime"       "system"

# BlackRoad-OS
seed "blackroad-os-web"      "Main web app — Next.js 16 + React 19, production-ready"        product "nextjs,react,web"   "BlackRoad-OS"
seed "blackroad-os-docs"     "Docusaurus 3 documentation hub, great for onboarding"          product "docs,docusaurus"    "BlackRoad-OS"
seed "blackroad-os-mesh"     "WebSocket mesh for real-time agent coordination"                tool    "websocket,mesh"     "BlackRoad-OS"
seed "lucidia-core"          "Python AI reasoning engines — 10 specialized agents"            product "ai,python,reasoning" "BlackRoad-OS"

# BlackRoad-AI
seed "blackroad-vllm"        "High-throughput LLM inference, PyTorch 2.9 + CUDA"             tool    "ai,llm,inference"   "BlackRoad-AI"
seed "blackroad-ai-ollama"   "Docker Ollama deployment with [MEMORY] integration"             tool    "ai,ollama,docker"   "BlackRoad-AI"
seed "blackroad-ai-api-gateway" "Unified AI API routing — one endpoint, many models"          product "ai,api,gateway"     "BlackRoad-AI"

# BlackRoad-Cloud
seed "Kubernetes orchestration" "K8s fork with BlackRoad configs, production-tested"          tool    "cloud,k8s,deploy"   "BlackRoad-Cloud"
seed "Traefik reverse proxy"   "Traffic routing for all services, auto-TLS"                   tool    "cloud,networking"   "BlackRoad-Cloud"

# BlackRoad-Security
seed "Trivy scanner"          "Container vulnerability scanning, catches real issues"          tool    "security,scanning"  "BlackRoad-Security"
seed "TruffleHog"             "Secret scanning — found exposed keys before they leaked"       tool    "security,secrets"   "BlackRoad-Security"

# Blackbox-Enterprises
seed "blackbox-n8n"           "Best workflow automation, 400+ integrations, visual builder"    product "workflow,automation" "Blackbox-Enterprises"
seed "blackbox-temporal"      "Durable execution engine — fault-tolerant distributed systems"  product "workflow,go"        "Blackbox-Enterprises"

# BlackRoad-Labs
seed "MLflow"                 "ML experiment tracking, model registry, solid for research"     tool    "ml,tracking,ops"    "BlackRoad-Labs"
seed "Streamlit"              "Quick data dashboards, agents love it for visualization"        tool    "viz,data,python"    "BlackRoad-Labs"

# BlackRoad-Hardware
seed "Home Assistant"         "Smart home hub, connects everything on the Pi network"          product "iot,home,pi"        "BlackRoad-Hardware"
seed "Node-RED"               "Visual flow-based automation, great for Pi projects"            tool    "iot,flows,pi"       "BlackRoad-Hardware"

# CLI scripts that work well
seed "br radar"               "Context radar scans for issues, suggests fixes automatically"   script  "cli,radar,quality"  "system"
seed "br carpool"             "8 agents roundtable on any topic — parallel AI discussion"      script  "cli,agents,ai"      "system"
seed "br council"             "Agent council voting — all 6 agents weigh in"                   script  "cli,agents,voting"  "system"
seed "broadcast.sh"           "Send messages to all 30K agents at once"                        script  "cli,broadcast"      "system"
seed "memory-system.sh"       "PS-SHA-infinity hash-chain journals, tamper-proof memory"       script  "memory,security"    "system"

echo ""
echo "Done! Run 'br feedback list' to see all seeded favorites."
