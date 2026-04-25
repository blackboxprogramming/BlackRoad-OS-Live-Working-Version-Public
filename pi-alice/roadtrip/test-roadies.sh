#!/bin/bash
# test-roadies.sh — Test Roadies integration with RoundTrip
# Usage: bash test-roadies.sh

set -e

PINK='\033[38;5;205m'
GREEN='\033[38;5;82m'
BLUE='\033[38;5;69m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

ROADIES_HOST="${ROADIES_HOST:-127.0.0.1:11436}"
RT_CLOUD="https://roundtrip.blackroad.io"

echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${PINK}  ROADIES x ROUNDTRIP INTEGRATION TEST${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"

# 1. Check Roadies is running
echo -e "\n${BLUE}[1] Checking Roadies on $ROADIES_HOST...${RESET}"
MODELS=$(curl -s "http://$ROADIES_HOST/api/tags" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('models',[])))" 2>/dev/null || echo "0")
if [ "$MODELS" -gt 0 ]; then
  echo -e "${GREEN}  $MODELS models loaded on Roadies${RESET}"
else
  echo -e "${AMBER}  Roadies not responding on $ROADIES_HOST${RESET}"
  exit 1
fi

# 2. Check RoundTrip cloud
echo -e "\n${BLUE}[2] Checking RoundTrip at $RT_CLOUD...${RESET}"
AGENTS=$(curl -s "$RT_CLOUD/api/health" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('agents',0))" 2>/dev/null || echo "0")
echo -e "${GREEN}  RoundTrip alive: $AGENTS agents${RESET}"

# 3. Check registered autonomy nodes
echo -e "\n${BLUE}[3] Checking autonomy nodes...${RESET}"
NODES=$(curl -s "$RT_CLOUD/api/autonomy/nodes?limit=50" | python3 -c "
import sys,json
d=json.load(sys.stdin)
nodes=d.get('nodes',[])
roadies=[n for n in nodes if n.get('role')=='roadie-agent']
devices=[n for n in nodes if n.get('role')!='roadie-agent']
print(f'{len(roadies)} roadie agents, {len(devices)} devices')
" 2>/dev/null)
echo -e "${GREEN}  $NODES registered${RESET}"

# 4. Test each Roadie agent
echo -e "\n${BLUE}[4] Testing all 20 Roadie agents...${RESET}"
PASS=0
FAIL=0
for agent in roadie-alice roadie-cecilia roadie-octavia roadie-aria roadie-lucidia roadie-gematria roadie-anastasia roadie-alexandria roadie-portia roadie-sophia roadie-athena roadie-calliope roadie-elias roadie-olympia roadie-magnolia roadie-sebastien roadie-silas roadie-ophelia roadie-lydia roadie-gaia; do
  RESP=$(curl -s "http://$ROADIES_HOST/api/generate" \
    -d "{\"model\":\"$agent\",\"prompt\":\"Say hello in one word.\",\"stream\":false,\"options\":{\"num_predict\":10,\"temperature\":0.3}}" 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('response','').strip(); print(r[:40] if r else '(empty)')" 2>/dev/null || echo "(error)")
  if [ "$RESP" != "(empty)" ] && [ "$RESP" != "(error)" ]; then
    echo -e "  ${GREEN}✓${RESET} $agent: $RESP"
    PASS=$((PASS+1))
  else
    echo -e "  ${AMBER}✗${RESET} $agent: $RESP"
    FAIL=$((FAIL+1))
  fi
done

# 5. Test agent-to-agent chat
echo -e "\n${BLUE}[5] Testing agent-to-agent chat (Alice -> Octavia)...${RESET}"
ALICE_MSG="Hey Octavia, how many repos do you have?"
ALICE_RESP=$(curl -s "http://$ROADIES_HOST/api/generate" \
  -d "{\"model\":\"roadie-alice\",\"prompt\":\"$ALICE_MSG\",\"stream\":false,\"options\":{\"num_predict\":40,\"temperature\":0.4}}" 2>/dev/null \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('response','').strip()[:120])" 2>/dev/null)
echo -e "  ${GREEN}Alice:${RESET} $ALICE_RESP"

OCTAVIA_RESP=$(curl -s "http://$ROADIES_HOST/api/generate" \
  -d "{\"model\":\"roadie-octavia\",\"prompt\":\"Alice asked: $ALICE_MSG. Respond as Octavia.\",\"stream\":false,\"options\":{\"num_predict\":40,\"temperature\":0.4}}" 2>/dev/null \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('response','').strip()[:120])" 2>/dev/null)
echo -e "  ${GREEN}Octavia:${RESET} $OCTAVIA_RESP"

# Summary
echo -e "\n${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  RESULTS: $PASS/$((PASS+FAIL)) agents responding${RESET}"
echo -e "${GREEN}  Roadies: http://$ROADIES_HOST (port 11436)${RESET}"
echo -e "${GREEN}  RoundTrip: $RT_CLOUD ($AGENTS agents)${RESET}"
echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
