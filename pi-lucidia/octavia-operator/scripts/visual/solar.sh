#!/bin/bash
# BR-Solar - Solar system orbits
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CX=$((COLS/2)) CY=$((LINES/2))
T=0

NAMES=("☿" "♀" "🜨" "♂" "♃" "♄" "⛢" "♆")
RADII=(3 5 7 10 14 18 22 26)
SPEEDS=(47 35 30 24 13 10 7 5)
COLORS=(245 228 82 196 214 220 51 69)

while true; do
  printf '\033[2J\033[H'

  # Draw orbits
  for ((p=0;p<8;p++)); do
    r=${RADII[$p]}
    for ((a=0;a<360;a+=15)); do
      ox=$(echo "scale=0; $CX + $r * 2 * c($a * 0.0174)" | bc -l 2>/dev/null)
      oy=$(echo "scale=0; $CY + $r * s($a * 0.0174)" | bc -l 2>/dev/null)
      [[ -n "$ox" && -n "$oy" ]] && (( ox>0 && ox<COLS && oy>0 && oy<LINES )) && \
        printf '\033[%d;%dH\033[38;5;236m·\033[0m' "$oy" "$ox"
    done
  done

  # Draw sun
  printf '\033[%d;%dH\033[1;38;5;226m☀\033[0m' "$CY" "$CX"

  # Draw planets
  for ((p=0;p<8;p++)); do
    r=${RADII[$p]}
    s=${SPEEDS[$p]}
    angle=$(( (T * s / 10) % 360 ))
    px=$(echo "scale=0; $CX + $r * 2 * c($angle * 0.0174)" | bc -l 2>/dev/null)
    py=$(echo "scale=0; $CY + $r * s($angle * 0.0174)" | bc -l 2>/dev/null)
    [[ -n "$px" && -n "$py" ]] && (( px>0 && px<COLS && py>0 && py<LINES )) && \
      printf '\033[%d;%dH\033[38;5;%dm%s\033[0m' "$py" "$px" "${COLORS[$p]}" "${NAMES[$p]}"
  done

  printf '\033[1;1H\033[38;5;226m☀ BR-Solar \033[38;5;69m[q=quit]\033[0m'
  T=$((T+1))
  sleep 0.1
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
