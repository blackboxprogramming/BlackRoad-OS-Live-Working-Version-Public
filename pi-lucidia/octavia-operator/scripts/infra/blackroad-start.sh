#!/bin/bash
# Start BlackRoad OS Gateway + Ollama Fleet
# Usage: ~/blackroad-start.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
RESET='\033[0m'

echo -e "${PINK}BlackRoad OS${RESET} — Starting gateway..."

# Check if already running
if curl -s http://127.0.0.1:8787/v1/health > /dev/null 2>&1; then
  echo -e "${GREEN}Gateway already running${RESET}"
  curl -s http://127.0.0.1:8787/v1/health | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'  v{d[\"version\"]} — uptime {d[\"uptime\"]}s')"
  echo ""
  echo -e "${BLUE}Fleet status:${RESET}"
  curl -s http://127.0.0.1:8787/v1/models | python3 -c "
import json,sys
d=json.load(sys.stdin)
for n in d['nodes']:
    s='up' if n['status']=='up' else 'DOWN'
    print(f'  {s:4} {n[\"node\"]:10} {len(n[\"models\"])} models')
"
  exit 0
fi

# Check local Ollama
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo -e "${AMBER}Starting Ollama...${RESET}"
  open -a Ollama 2>/dev/null || ollama serve &
  sleep 3
fi

# Build fleet string — discover which Pi Ollama instances are reachable
FLEET="local=http://localhost:11434"

echo -e "${BLUE}Discovering Pi fleet...${RESET}"

# Octavia (.100)
if curl -s --connect-timeout 2 http://192.168.4.100:11434/api/tags > /dev/null 2>&1; then
  FLEET="$FLEET,octavia=http://192.168.4.100:11434"
  echo -e "  ${GREEN}Octavia (.100)${RESET} — online"
else
  echo -e "  ${AMBER}Octavia (.100)${RESET} — offline"
fi

# Lucidia (.38)
if curl -s --connect-timeout 2 http://192.168.4.38:11434/api/tags > /dev/null 2>&1; then
  FLEET="$FLEET,lucidia=http://192.168.4.38:11434"
  echo -e "  ${GREEN}Lucidia (.38)${RESET} — online"
else
  echo -e "  ${AMBER}Lucidia (.38)${RESET} — offline"
fi

# Cecilia (.96)
if curl -s --connect-timeout 2 http://192.168.4.96:11434/api/tags > /dev/null 2>&1; then
  FLEET="$FLEET,cecilia=http://192.168.4.96:11434"
  echo -e "  ${GREEN}Cecilia (.96)${RESET} — online"
else
  echo -e "  ${AMBER}Cecilia (.96)${RESET} — offline"
fi

# Alice (.49) — try SSH tunnel if direct fails
if curl -s --connect-timeout 2 http://192.168.4.49:11434/api/tags > /dev/null 2>&1; then
  FLEET="$FLEET,alice=http://192.168.4.49:11434"
  echo -e "  ${GREEN}Alice (.49)${RESET} — online"
else
  # Try SSH tunnel
  pkill -f "ssh.*11435.*192.168.4.49" 2>/dev/null
  if ssh -o ConnectTimeout=3 -fN -L 11435:127.0.0.1:11434 pi@192.168.4.49 2>/dev/null; then
    sleep 1
    if curl -s --connect-timeout 2 http://localhost:11435/api/tags > /dev/null 2>&1; then
      FLEET="$FLEET,alice=http://localhost:11435"
      echo -e "  ${GREEN}Alice (.49)${RESET} — online (SSH tunnel)"
    else
      echo -e "  ${AMBER}Alice (.49)${RESET} — offline"
    fi
  else
    echo -e "  ${AMBER}Alice (.49)${RESET} — offline"
  fi
fi

echo ""

# Start gateway with fleet
cd ~/BlackRoad-OS-Inc/blackroad-core
BLACKROAD_OLLAMA_FLEET="$FLEET" \
  nohup npx tsx src/index.ts > /tmp/blackroad-gateway.log 2>&1 &
GATEWAY_PID=$!
echo $GATEWAY_PID > /tmp/blackroad-gateway.pid

sleep 3

if curl -s http://127.0.0.1:8787/v1/health > /dev/null 2>&1; then
  echo -e "${GREEN}Gateway started${RESET} (PID $GATEWAY_PID)"
  echo ""

  # Show fleet
  echo -e "${BLUE}Fleet models:${RESET}"
  curl -s http://127.0.0.1:8787/v1/models | python3 -c "
import json,sys
d=json.load(sys.stdin)
for n in d['nodes']:
    s='UP' if n['status']=='up' else 'DOWN'
    models=', '.join(n['models'][:6])
    extra=f' +{len(n[\"models\"])-6} more' if len(n['models'])>6 else ''
    print(f'  {s:4} {n[\"node\"]:10} {len(n[\"models\"]):2} models  {models}{extra}')
"

  echo ""
  echo -e "  ${AMBER}Endpoints:${RESET}"
  echo "    GET  http://127.0.0.1:8787/v1/health"
  echo "    GET  http://127.0.0.1:8787/v1/agents"
  echo "    GET  http://127.0.0.1:8787/v1/models"
  echo "    POST http://127.0.0.1:8787/v1/chat/completions"
  echo "    POST http://127.0.0.1:8787/v1/invoke"
  echo ""
  echo -e "  ${AMBER}Examples:${RESET}"
  echo '    curl -X POST http://127.0.0.1:8787/v1/chat/completions \'
  echo '      -H "Content-Type: application/json" \'
  echo '      -d '\''{"messages":[{"role":"user","content":"hello"}],"model":"llama3.2:3b"}'\'''
  echo ""
  echo '    curl -X POST http://127.0.0.1:8787/v1/invoke \'
  echo '      -H "Content-Type: application/json" \'
  echo '      -d '\''{"agent":"octavia","task":"Review my architecture"}'\'''
else
  echo -e "\033[38;5;196mFailed to start. Check /tmp/blackroad-gateway.log${RESET}"
  exit 1
fi
