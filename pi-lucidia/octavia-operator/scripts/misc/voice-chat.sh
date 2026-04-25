#!/bin/bash
# BR-Voice - Voice chat with AI (TTS via Cecilia)
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

clear
printf "${PINK}╔══════════════════════════════════════╗${RESET}\n"
printf "${PINK}║       🎙  BR-Voice Chat  🎙         ║${RESET}\n"
printf "${PINK}╚══════════════════════════════════════╝${RESET}\n\n"

# Check for say command (macOS TTS)
if ! command -v say &>/dev/null; then
  printf "${AMBER}⚠  'say' not found${RESET}\n"; exit 1
fi

VOICES=($(say -v '?' | awk '{print $1}' | head -10))
printf "${BLUE}Available voices:${RESET}\n"
for i in "${!VOICES[@]}"; do
  printf "  ${GREEN}%d${RESET}) %s\n" "$((i+1))" "${VOICES[$i]}"
done

printf "\n${BLUE}Select voice [1]: ${RESET}"
read -r vc
[[ -z "$vc" ]] && vc=1
VOICE=${VOICES[$((vc-1))]}
printf "${GREEN}Using voice: $VOICE${RESET}\n\n"

while true; do
  printf "${PINK}You> ${RESET}"
  read -r msg
  [[ -z "$msg" || "$msg" == "quit" || "$msg" == "q" ]] && break

  # Try Ollama on localhost first, then Cecilia
  response=""
  if curl -s --connect-timeout 2 http://localhost:11434/api/tags &>/dev/null; then
    response=$(curl -s http://localhost:11434/api/generate -d "{\"model\":\"llama3.2\",\"prompt\":\"$msg\",\"stream\":false}" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('response',''))" 2>/dev/null)
  fi
  if [[ -z "$response" ]]; then
    response=$(ssh -o ConnectTimeout=3 cecilia "curl -s http://localhost:11434/api/generate -d '{\"model\":\"llama3.2\",\"prompt\":\"$msg\",\"stream\":false}'" 2>/dev/null | python3 -c "import sys,json; print(json.load(sys.stdin).get('response',''))" 2>/dev/null)
  fi
  if [[ -z "$response" ]]; then
    response="I couldn't connect to any AI model. Check Ollama on localhost or Cecilia."
  fi

  printf "${GREEN}AI> ${RESET}%s\n\n" "$response"
  say -v "$VOICE" "$response" &
done
printf "${AMBER}Goodbye!${RESET}\n"
