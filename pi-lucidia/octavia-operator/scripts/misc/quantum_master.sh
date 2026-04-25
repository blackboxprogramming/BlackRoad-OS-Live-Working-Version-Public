#!/bin/bash
# BR-Quantum - Quantum circuit simulator visualization
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'
COLS=$(tput cols) LINES=$(tput lines)

draw_circuit() {
  local qubits=$1 gates=$2
  printf "\n${VIOLET}  Quantum Circuit (%d qubits, %d gates):${RESET}\n\n" "$qubits" "$gates"
  GATE_NAMES=("H" "X" "Y" "Z" "S" "T" "CNOT" "SWAP" "RX" "RZ")
  for ((q=0;q<qubits;q++)); do
    line="  ${BLUE}|q${q}⟩${RESET} ─"
    for ((g=0;g<gates;g++)); do
      if (( RANDOM % 3 == 0 )); then
        gn=${GATE_NAMES[$((RANDOM % ${#GATE_NAMES[@]}))]}
        line+="─┤${PINK}${gn}${RESET}├─"
      else
        line+="──────"
      fi
    done
    line+="── ${GREEN}📊${RESET}"
    printf "%b\n" "$line"
    if (( q < qubits - 1 )); then
      printf "         "
      for ((g=0;g<gates;g++)); do
        if (( RANDOM % 8 == 0 )); then
          printf "  ${AMBER}│${RESET}   "
        else
          printf "      "
        fi
      done
      printf "\n"
    fi
  done
}

simulate() {
  local qubits=$1 shots=$2
  printf "\n${GREEN}  Simulating %d shots...${RESET}\n\n" "$shots"
  declare -A results
  states=$((1 << qubits))
  for ((s=0;s<shots;s++)); do
    state=$(printf "%0${qubits}d" $(echo "obase=2; $((RANDOM % states))" | bc))
    results["$state"]=$(( ${results["$state"]:-0} + 1 ))
  done

  # Sort and display histogram
  for state in $(echo "${!results[@]}" | tr ' ' '\n' | sort); do
    count=${results[$state]}
    pct=$((count * 100 / shots))
    bar=""
    for ((b=0;b<pct/2;b++)); do bar+="█"; done
    printf "  ${BLUE}|%s⟩${RESET} %4d (%2d%%) ${PINK}%s${RESET}\n" "$state" "$count" "$pct" "$bar"
  done
}

while true; do
  clear
  printf "${PINK}╔════════════════════════════════════════╗${RESET}\n"
  printf "${PINK}║      ⚛  BR-Quantum Simulator  ⚛      ║${RESET}\n"
  printf "${PINK}╚════════════════════════════════════════╝${RESET}\n"

  draw_circuit 4 6
  simulate 4 1000

  printf "\n  ${BLUE}[Enter=regenerate, q=quit]${RESET} "
  read -rsn1 K
  [[ "$K" == "q" ]] && exit
done
