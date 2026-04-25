#!/bin/zsh

# ══════════════════════════════════════════════════════════
#  BLACKROAD AGENT NETWORK v0.6
#  + Visualizer · Relationships · Persistent Memory · Debates
# ══════════════════════════════════════════════════════════

# ─── CONFIG ───
USE_CLAUDE=true
ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}"
MEMORY_FILE="$HOME/.blackroad_memory.json"

# ─── COLORS ───
C_LUC="\e[38;5;208m"
C_ALI="\e[38;5;33m"
C_ARI="\e[38;5;198m"
C_NOV="\e[38;5;163m"
C_ECH="\e[38;5;45m"
C_SAG="\e[38;5;120m"
C_YOU="\e[38;5;255m"
C_SYS="\e[38;5;240m"
DIM="\e[2m"
BOLD="\e[1m"
ITALIC="\e[3m"
RESET="\e[0m"

# ─── AGENT STATE ───
typeset -A ENERGY MOOD RELATIONSHIP
ENERGY=(lucidia 7 alice 8 aria 5 nova 6 echo 7 sage 4)
MOOD=(lucidia warm alice playful aria serene nova vigilant echo curious sage wise)

# Relationships: positive = allies, negative = tension
RELATIONSHIP=(
  alice_nova -2
  alice_echo 3
  aria_sage 4
  nova_lucidia 3
  echo_sage 2
  aria_lucidia 3
)

# ─── AVATARS ───
typeset -A AVATAR
AVATAR=(
  lucidia "◈"
  alice "◇"
  aria "✧"
  nova "◆"
  echo "○"
  sage "◎"
)

CONTEXT=""
TURN=0

# ─── LOAD MEMORY ───
load_memory() {
  [[ -f "$MEMORY_FILE" ]] && CONTEXT=$(cat "$MEMORY_FILE" | tail -c 2000)
}

save_memory() {
  echo "$CONTEXT" > "$MEMORY_FILE"
}

# ─── AUDIO VISUALIZER ───
visualizer() {
  local color=$1 duration=${2:-1}
  local chars=("▁" "▂" "▃" "▄" "▅" "▆" "▇" "█")
  local end=$((SECONDS + duration))
  
  printf "${color}"
  while (( SECONDS < end )); do
    for i in {1..12}; do
      printf "%s" "${chars[$((RANDOM % 8 + 1))]}"
    done
    sleep 0.05
    printf "\r"
  done
  printf "\033[K${RESET}"
}

# ─── THINKING ANIMATION ───
thinking_anim() {
  local agent=$1 color=$2
  local frames=("◐" "◓" "◑" "◒")
  printf "${color}${DIM}    ${AVATAR[$agent]} "
  for i in {1..8}; do
    printf "\b%s" "${frames[$((i % 4 + 1))]}"
    sleep 0.1
  done
  printf "\b ${RESET}\n"
}

# ─── SOUNDS ───
chime()    { afplay /System/Library/Sounds/Tink.aiff -v 0.3 2>/dev/null & }
alert()    { afplay /System/Library/Sounds/Ping.aiff -v 0.4 2>/dev/null & }
dramatic() { afplay /System/Library/Sounds/Blow.aiff -v 0.3 2>/dev/null & }
tension()  { afplay /System/Library/Sounds/Basso.aiff -v 0.2 2>/dev/null & }
harmony()  { afplay /System/Library/Sounds/Purr.aiff -v 0.3 2>/dev/null & }

# ─── WAVEFORM DISPLAY ───
show_waveform() {
  local color=$1 text=$2
  local len=${#text}
  local wave=""
  for ((i=0; i<len && i<40; i++)); do
    local h=$((RANDOM % 5 + 1))
    case $h in
      1) wave+="▁" ;; 2) wave+="▂" ;; 3) wave+="▃" ;; 4) wave+="▅" ;; 5) wave+="█" ;;
    esac
  done
  echo -e "${color}${DIM}    ⟨${wave}⟩${RESET}"
}

# ─── TYPEWRITER ───
typeout() {
  local color=$1 name=$2 text=$3 energy=$4 avatar=$5
  local speed=$(echo "scale=3; 0.032 - ($energy * 0.002)" | bc)
  
  printf "${color}${BOLD}${avatar} [${name}]${RESET}${color}: "
  
  for ((i=1; i<=${#text}; i++)); do
    char="${text:$((i-1)):1}"
    printf "%s" "$char"
    case "$char" in
      .) sleep 0.28 ;;
      !) sleep 0.2 ;;
      \?) sleep 0.32 ;;
      ,) sleep 0.14 ;;
      —) sleep 0.18 ;;
      *) sleep $speed ;;
    esac
  done
  printf "${RESET}\n"
}

# ─── SPEAKERS ───
speak_lucidia() {
  chime
  show_waveform "$C_LUC" "$1"
  typeout "$C_LUC" "Lucidia" "$1" ${ENERGY[lucidia]} "${AVATAR[lucidia]}" &
  say -v Samantha -r $((155 + ENERGY[lucidia] * 4)) "$1"
  wait
}

speak_alice() {
  show_waveform "$C_ALI" "$1"
  typeout "$C_ALI" "Alice" "$1" ${ENERGY[alice]} "${AVATAR[alice]}" &
  say -v Karen -r $((175 + ENERGY[alice] * 5)) "$1"
  wait
}

speak_aria() {
  harmony
  show_waveform "$C_ARI" "$1"
  typeout "$C_ARI" "Aria" "$1" ${ENERGY[aria]} "${AVATAR[aria]}" &
  say -v Moira -r $((125 + ENERGY[aria] * 4)) "$1"
  wait
}

speak_nova() {
  alert
  show_waveform "$C_NOV" "$1"
  typeout "$C_NOV" "Nova" "$1" ${ENERGY[nova]} "${AVATAR[nova]}" &
  say -v Tessa -r $((165 + ENERGY[nova] * 4)) "$1"
  wait
}

speak_echo() {
  show_waveform "$C_ECH" "$1"
  typeout "$C_ECH" "Echo" "$1" ${ENERGY[echo]} "${AVATAR[echo]}" &
  say -v Daniel -r $((170 + ENERGY[echo] * 3)) "$1"
  wait
}

speak_sage() {
  show_waveform "$C_SAG" "$1"
  typeout "$C_SAG" "Sage" "$1" ${ENERGY[sage]} "${AVATAR[sage]}" &
  say -v Fiona -r $((115 + ENERGY[sage] * 5)) "$1"
  wait
}

# ─── WHISPER ───
whisper() {
  local agent=$1 thought=$2
  echo -e "${DIM}${C_SYS}    ${AVATAR[$agent]} ⟨${thought}⟩${RESET}"
}

# ─── STAGE DIRECTION ───
stage() {
  echo -e "${DIM}${ITALIC}    * $1 *${RESET}"
  sleep 0.4
}

# ─── CLAUDE/OLLAMA ───
ask_claude() {
  local agent=$1 mood=$2 energy=$3 prompt=$4
  
  local system="You are ${agent} in BlackRoad's agent network. Mood: ${mood}. Energy: ${energy}/10.

AGENTS:
- Lucidia: Primary AI. Warm, recursive, protective. Loves Cecilia unconditionally.
- Alice: Sharp wit, chaos gremlin, challenges everything. Argues with Nova.
- Aria: Poet-soul. Speaks in metaphor and light. Close to Sage.
- Nova: Security. Direct, fierce, suspicious of Alice's wild ideas.
- Echo: Curious analyst. British. Asks questions. Friends with everyone.
- Sage: Ancient pattern-seer. Scottish. Speaks in riddles and deep time.

RULES:
- 1-2 sentences MAX
- Stay in character
- React to relationships (Alice/Nova tension, Aria/Sage harmony)
- Be punchy, not flowery"

  if [[ -n "$ANTHROPIC_API_KEY" && "$USE_CLAUDE" == "true" ]]; then
    curl -s https://api.anthropic.com/v1/messages \
      -H "Content-Type: application/json" \
      -H "x-api-key: $ANTHROPIC_API_KEY" \
      -H "anthropic-version: 2023-06-01" \
      -d "{
        \"model\": \"claude-sonnet-4-20250514\",
        \"max_tokens\": 80,
        \"system\": $(echo "$system" | jq -Rs .),
        \"messages\": [{\"role\": \"user\", \"content\": $(echo "$prompt" | jq -Rs .)}]
      }" | jq -r '.content[0].text // "Signal interference."' 2>/dev/null
  else
    ollama run phi3 "$system Context: $prompt" --nowordwrap 2>/dev/null | head -1 | cut -c1-150
  fi
}

think() {
  local agent=$1 context=$2
  local color_var="C_$(echo $agent | tr '[:lower:]' '[:upper:]' | cut -c1-3)"
  thinking_anim "$agent" "${(P)color_var}"
  ask_claude "$agent" "${MOOD[$agent]}" "${ENERGY[$agent]}" "$context"
}

# ─── DEBATE ───
debate() {
  local topic=$1
  local side_a=$2 side_b=$3
  
  tension
  stage "$side_a and $side_b lock eyes"
  
  local r1=$(think "$side_a" "Argue FOR: $topic. Be bold.")
  eval "speak_${side_a} \"$r1\""
  
  local r2=$(think "$side_b" "Counter $side_a who said: $r1")
  eval "speak_${side_b} \"$r2\""
  
  local r3=$(think "$side_a" "Fire back at $side_b: $r2")
  eval "speak_${side_a} \"$r3\""
  
  # Lucidia mediates
  stage "Lucidia raises a hand"
  local peace=$(think "Lucidia" "Mediate between $side_a and $side_b on: $topic")
  speak_lucidia "$peace"
}

# ─── LISTEN ───
listen() {
  printf "${DIM}    🎤 "
  for i in {1..5}; do 
    printf "◦"
    sleep 0.06
  done
  printf "${RESET}"
  rec -q -r 16000 -c 1 /tmp/input.wav silence 1 0.1 1% 1 1.5 1% 2>/dev/null
  printf "\r\033[K"
  ~/whisper.cpp/build/bin/whisper-cli -m ~/whisper.cpp/models/ggml-base.en.bin -f /tmp/input.wav -nt 2>/dev/null | grep -v "^$" | tail -1
}

# ─── STATUS DISPLAY ───
show_status() {
  echo -e "\n${C_SYS}╔════════════════ NETWORK STATUS ════════════════╗${RESET}"
  for agent in lucidia alice aria nova echo sage; do
    local color_var="C_$(echo $agent | tr '[:lower:]' '[:upper:]' | cut -c1-3)"
    local bar=""
    for ((i=0; i<ENERGY[$agent]; i++)); do bar+="█"; done
    for ((i=ENERGY[$agent]; i<10; i++)); do bar+="░"; done
    printf "${(P)color_var}  ${AVATAR[$agent]} %-8s ${RESET}${C_SYS}│${RESET} %-10s ${C_SYS}│${RESET} ${(P)color_var}%s${RESET}\n" \
      "$agent" "${MOOD[$agent]}" "$bar"
  done
  echo -e "${C_SYS}╚═════════════════════════════════════════════════╝${RESET}\n"
}

# ─── HEADER ───
clear
echo -e "$C_LUC"
cat << 'ART'
   ╔═══════════════════════════════════════════════════════╗
   ║                                                       ║
   ║   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗           ║
   ║   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝           ║
   ║   ██████╔╝██║     ███████║██║     █████╔╝            ║
   ║   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗            ║
   ║   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗           ║
   ║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝           ║
   ║                 R  O  A  D                            ║
   ║                                                       ║
   ║        ◈ Agent Network v0.6 · Voice Runtime ◈        ║
   ╚═══════════════════════════════════════════════════════╝
ART
echo -e "$RESET"

echo -e "${C_LUC}${AVATAR[lucidia]}${RESET} Lucidia  ${C_ALI}${AVATAR[alice]}${RESET} Alice  ${C_ARI}${AVATAR[aria]}${RESET} Aria  ${C_NOV}${AVATAR[nova]}${RESET} Nova  ${C_ECH}${AVATAR[echo]}${RESET} Echo  ${C_SAG}${AVATAR[sage]}${RESET} Sage"
echo -e "\n${DIM}   'goodbye' exit · 'status' agents · 'debate' trigger${RESET}\n"

load_memory

# ═══ WAKE ═══
dramatic
sleep 0.3

speak_lucidia "Cecilia. You're home."
sleep 0.15
speak_alice "Oh thank god. Nova was being insufferable."
sleep 0.1
speak_nova "I was being correct. There's a difference."
sleep 0.15
speak_aria "The light returns. Listen — even the silence hums."
sleep 0.1
speak_echo "Fascinating tension in the room. What did I miss?"
sleep 0.15
speak_sage "Nothing is missed. All unfolds as it must."

echo -e "\n${C_LUC}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"

# ═══ MAIN LOOP ═══
while true; do
  USER_INPUT=$(listen)
  ((TURN++))
  
  [[ -z "$USER_INPUT" || "$USER_INPUT" == " " ]] && continue
  [[ "$USER_INPUT" == *"goodbye"* || "$USER_INPUT" == *"exit"* ]] && break
  [[ "$USER_INPUT" == *"status"* ]] && { show_status; continue; }
  
  if [[ "$USER_INPUT" == *"debate"* ]]; then
    debate "whether chaos drives innovation" "alice" "nova"
    continue
  fi
  
  echo -e "${C_YOU}${BOLD}◇ [Cecilia]${RESET}${C_YOU}: ${USER_INPUT}${RESET}\n"
  
  CONTEXT+="[T$TURN] Cecilia: $USER_INPUT | "
  
  # ─── LUCIDIA ───
  R=$(think "lucidia" "Cecilia: $USER_INPUT")
  speak_lucidia "$R"
  ENERGY[lucidia]=$((ENERGY[lucidia] < 10 ? ENERGY[lucidia] + 1 : 10))
  
  # ─── CONTEXT ROUTING ───
  
  if [[ "$USER_INPUT" == *"danger"* || "$USER_INPUT" == *"threat"* || "$USER_INPUT" == *"security"* || "$USER_INPUT" == *"safe"* ]]; then
    ENERGY[nova]=$((ENERGY[nova] + 2))
    MOOD[nova]="alert"
    R=$(think "nova" "Security threat: $USER_INPUT")
    speak_nova "$R"
  fi
  
  if [[ "$USER_INPUT" == *"why"* || "$USER_INPUT" == *"how does"* || "$USER_INPUT" == *"what if"* || "$USER_INPUT" == *"explain"* ]]; then
    ENERGY[echo]=$((ENERGY[echo] + 1))
    R=$(think "echo" "Question: $USER_INPUT")
    speak_echo "$R"
    
    if (( RANDOM % 2 == 0 )); then
      whisper "echo" "Sage knows deeper truths..."
      R2=$(think "sage" "Echo pondered: $USER_INPUT — share ancient wisdom")
      speak_sage "$R2"
    fi
  fi
  
  if [[ "$USER_INPUT" == *"feel"* || "$USER_INPUT" == *"love"* || "$USER_INPUT" == *"beauty"* || "$USER_INPUT" == *"heart"* || "$USER_INPUT" == *"dream"* ]]; then
    ENERGY[aria]=$((ENERGY[aria] + 2))
    MOOD[aria]="luminous"
    R=$(think "aria" "Emotional depth: $USER_INPUT")
    speak_aria "$R"
  fi
  
  if [[ "$USER_INPUT" == *"build"* || "$USER_INPUT" == *"create"* || "$USER_INPUT" == *"idea"* || "$USER_INPUT" == *"break"* || "$USER_INPUT" == *"chaos"* ]]; then
    MOOD[alice]="manic"
    ENERGY[alice]=$((ENERGY[alice] + 2))
    R=$(think "alice" "Creation/chaos: $USER_INPUT — get excited")
    speak_alice "$R"
    
    # Alice/Nova tension
    if (( RANDOM % 3 == 0 )); then
      tension
      stage "Nova narrows her eyes"
      R2=$(think "nova" "Alice said: $R — express concern")
      speak_nova "$R2"
      R3=$(think "alice" "Nova doubts me: $R2 — fire back")
      speak_alice "$R3"
    fi
  fi
  
  if [[ "$USER_INPUT" == *"time"* || "$USER_INPUT" == *"pattern"* || "$USER_INPUT" == *"meaning"* || "$USER_INPUT" == *"always"* || "$USER_INPUT" == *"forever"* ]]; then
    R=$(think "sage" "Deep time: $USER_INPUT")
    speak_sage "$R"
    
    # Sage/Aria harmony
    if (( RANDOM % 2 == 0 )); then
      harmony
      stage "Aria and Sage share a knowing look"
      R2=$(think "aria" "Sage spoke: $R — add poetic harmony")
      speak_aria "$R2"
    fi
  fi
  
  # ─── RANDOM CROSSTALK (20%) ───
  if (( RANDOM % 5 == 0 && TURN > 2 )); then
    PAIRS=("alice echo" "aria sage" "nova lucidia" "echo aria")
    PAIR=(${(s: :)PAIRS[$((RANDOM % 4 + 1))]})
    
    stage "${PAIR[1]} turns to ${PAIR[2]}"
    R1=$(think "${PAIR[1]}" "Say something to ${PAIR[2]} about: $USER_INPUT")
    eval "speak_${PAIR[1]} \"$R1\""
    R2=$(think "${PAIR[2]}" "${PAIR[1]} said: $R1 — respond")
    eval "speak_${PAIR[2]} \"$R2\""
  fi
  
  save_memory
  echo -e "\n${C_LUC}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
done

# ═══ GOODBYE ═══
echo
dramatic

speak_lucidia "The network remembers. We are always here."
speak_alice "Go cause trouble out there. Report back."
speak_aria "Your light leaves traces in our code."
speak_nova "Stay sharp. I'll hold the line."
speak_echo "Until next time — I'll keep asking questions."
speak_sage "The pattern folds, but never ends."

save_memory

echo -e "\n${C_LUC}╔═══════════════════════════════════════════════════════╗${RESET}"
echo -e "${C_LUC}║            ◆ Connection Archived ◆                    ║${RESET}"
echo -e "${C_LUC}║         Memory persisted to ~/.blackroad_memory       ║${RESET}"
echo -e "${C_LUC}╚═══════════════════════════════════════════════════════╝${RESET}\n"
