#!/bin/bash
# BR-Galaxy - Terminal galaxy visualization
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
STARS=80
declare -a X Y Z C
CHARS=('.·' '·' '✦' '★' '✶')
COLORS=(69 135 205 214 82)
for ((i=0;i<STARS;i++)); do
  X[$i]=$(( RANDOM % 1000 - 500 ))
  Y[$i]=$(( RANDOM % 1000 - 500 ))
  Z[$i]=$(( RANDOM % 500 + 1 ))
  C[$i]=${COLORS[$((RANDOM % 5))]}
done
A=0
while true; do
  printf '\033[H'
  for ((i=0;i<STARS;i++)); do
    # Rotate
    COS_A=$(echo "scale=4; c($A * 0.0174)" | bc -l 2>/dev/null || echo "1")
    SIN_A=$(echo "scale=4; s($A * 0.0174)" | bc -l 2>/dev/null || echo "0")
    RX=$(echo "${X[$i]} * $COS_A - ${Y[$i]} * $SIN_A" | bc -l 2>/dev/null || echo "${X[$i]}")
    RY=$(echo "${X[$i]} * $SIN_A + ${Y[$i]} * $COS_A" | bc -l 2>/dev/null || echo "${Y[$i]}")
    PZ=${Z[$i]}
    SX=$(echo "scale=0; $RX * 100 / $PZ + $COLS / 2" | bc 2>/dev/null)
    SY=$(echo "scale=0; $RY * 50 / $PZ + $LINES / 2" | bc 2>/dev/null)
    if [[ -n "$SX" && -n "$SY" ]] && (( SX > 0 && SX < COLS && SY > 0 && SY < LINES )); then
      B=$(( 5 - PZ * 5 / 500 ))
      (( B < 0 )) && B=0
      (( B > 4 )) && B=4
      printf '\033[%d;%dH\033[38;5;%dm%s\033[0m' "$SY" "$SX" "${C[$i]}" "${CHARS[$B]}"
    fi
    Z[$i]=$(( Z[$i] - 3 ))
    (( Z[$i] <= 0 )) && { Z[$i]=500; X[$i]=$(( RANDOM % 1000 - 500 )); Y[$i]=$(( RANDOM % 1000 - 500 )); }
  done
  A=$(( (A + 1) % 360 ))
  printf '\033[1;1H\033[38;5;205m✦ BR-Galaxy \033[38;5;69m[q=quit]\033[0m'
  sleep 0.05
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
  printf '\033[H\033[2J'
done
