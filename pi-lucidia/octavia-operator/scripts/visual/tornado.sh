#!/bin/bash
# BR-Tornado - Spinning tornado vortex
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CX=$((COLS/2))
T=0
DEBRIS='~*.:;+#@%&'
COLORS=(240 244 248 252 231 195 159 123 87 51)

while true; do
  printf '\033[2J\033[H'
  for ((y=2;y<LINES-1;y++)); do
    # Width increases toward bottom
    w=$(( (y * 2) + 2 ))
    offset=$(echo "scale=0; s(($T + $y) * 0.3) * $w / 3" | bc -l 2>/dev/null || echo "0")
    cx=$(( CX + offset ))

    # Draw funnel
    hw=$((w/2))
    for ((dx=-hw;dx<=hw;dx++)); do
      px=$((cx + dx))
      if (( px > 0 && px < COLS )); then
        # Only draw edges and some interior
        if (( dx == -hw || dx == hw || RANDOM % w < 3 )); then
          ci=$(( y * ${#COLORS[@]} / LINES ))
          (( ci >= ${#COLORS[@]} )) && ci=$((${#COLORS[@]}-1))
          ch=${DEBRIS:$((RANDOM % ${#DEBRIS})):1}
          printf '\033[%d;%dH\033[38;5;%dm%s\033[0m' "$y" "$px" "${COLORS[$ci]}" "$ch"
        fi
      fi
    done
  done

  # Ground debris
  for ((i=0;i<COLS;i++)); do
    if (( RANDOM % 5 == 0 )); then
      printf '\033[%d;%dH\033[38;5;94m%s\033[0m' "$((LINES-1))" "$((i+1))" "${DEBRIS:$((RANDOM % ${#DEBRIS})):1}"
    fi
  done

  printf '\033[1;1H\033[38;5;248m🌪 BR-Tornado \033[38;5;69m[q=quit]\033[0m'
  T=$((T+1))
  sleep 0.08
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
