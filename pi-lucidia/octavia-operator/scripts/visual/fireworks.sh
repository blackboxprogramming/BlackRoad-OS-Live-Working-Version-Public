#!/bin/bash
# BR-Fireworks - Terminal fireworks display
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
COLORS=(196 202 208 214 220 226 46 51 57 93 129 165 201 205)

launch_firework() {
  local cx=$(( RANDOM % (COLS-10) + 5 ))
  local cy=$(( RANDOM % (LINES/2) + 3 ))
  local color=${COLORS[$((RANDOM % ${#COLORS[@]}))]}
  local size=$(( RANDOM % 5 + 3 ))

  # Launch trail
  for ((y=LINES-1;y>cy;y--)); do
    printf '\033[%d;%dH\033[38;5;231m|\033[0m' "$y" "$cx"
    sleep 0.02
    printf '\033[%d;%dH ' "$y" "$cx"
  done

  # Explode
  for ((r=1;r<=size;r++)); do
    for ((a=0;a<360;a+=30)); do
      px=$(echo "scale=0; $cx + $r * 2 * c($a * 0.0174)" | bc -l 2>/dev/null)
      py=$(echo "scale=0; $cy + $r * s($a * 0.0174)" | bc -l 2>/dev/null)
      if [[ -n "$px" && -n "$py" ]] && (( px > 0 && px < COLS && py > 0 && py < LINES )); then
        printf '\033[%d;%dH\033[38;5;%dm✦\033[0m' "$py" "$px" "$color"
      fi
    done
    sleep 0.05
  done

  # Fade
  sleep 0.3
  for ((r=1;r<=size;r++)); do
    for ((a=0;a<360;a+=30)); do
      px=$(echo "scale=0; $cx + $r * 2 * c($a * 0.0174)" | bc -l 2>/dev/null)
      py=$(echo "scale=0; $cy + $r * s($a * 0.0174)" | bc -l 2>/dev/null)
      if [[ -n "$px" && -n "$py" ]] && (( px > 0 && px < COLS && py > 0 && py < LINES )); then
        printf '\033[%d;%dH \033[0m' "$py" "$px"
      fi
    done
  done
}

printf '\033[38;5;205m'
while true; do
  printf '\033[1;1H\033[38;5;205m🎆 BR-Fireworks \033[38;5;69m[q=quit]\033[0m'
  launch_firework &
  sleep 0.$(( RANDOM % 5 + 3 ))
  wait
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
