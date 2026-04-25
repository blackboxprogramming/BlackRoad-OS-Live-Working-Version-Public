#!/bin/bash
# BR-Waves - 3D wave simulation
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CX=$((COLS/2)) CY=$((LINES/2))
W=30 H=20
T=0
SHADING=' .:-=+*#%@█'

while true; do
  printf '\033[H'
  for ((gy=0;gy<H;gy++)); do
    line=""
    for ((gx=0;gx<W;gx++)); do
      # Wave height
      wave=$(echo "s(($gx - $W/2 + $T) * 0.4) * 3 + s(($gy - $H/2 + $T) * 0.3) * 2" | bc -l 2>/dev/null || echo "0")
      hi=$(echo "scale=0; ($wave + 5) * 10 / 10" | bc 2>/dev/null || echo "5")

      # Isometric projection
      sx=$(echo "scale=0; $CX + ($gx - $gy) * 2" | bc)
      sy=$(echo "scale=0; $CY/2 + ($gx + $gy) / 2 - $hi" | bc)

      if [[ -n "$sx" && -n "$sy" ]] && (( sx>0 && sx<COLS && sy>0 && sy<LINES )); then
        (( hi < 0 )) && hi=0
        (( hi > 10 )) && hi=10
        sh=${SHADING:$hi:1}
        # Color by height
        if (( hi > 7 )); then col=231
        elif (( hi > 5 )); then col=69
        elif (( hi > 3 )); then col=33
        else col=17; fi
        printf '\033[%d;%dH\033[38;5;%dm%s\033[0m' "$sy" "$sx" "$col" "$sh"
      fi
    done
  done
  printf '\033[1;1H\033[38;5;69m🌊 BR-Waves \033[38;5;69m[q=quit]\033[0m'
  T=$((T+1))
  sleep 0.1
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
