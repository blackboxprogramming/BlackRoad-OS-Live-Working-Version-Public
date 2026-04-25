#!/bin/bash
# BR-Plasma - Colorful plasma effect
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(( $(tput cols) / 2 )) LINES=$(( $(tput lines) - 1 ))
(( COLS > 50 )) && COLS=50
(( LINES > 25 )) && LINES=25
T=0
GRADIENT=(16 17 18 19 20 21 57 93 129 165 201 200 199 198 197 196 202 208 214 220 226 190 154 118 82 46 47 48 49 50 51 45 39 33 27 21)
GL=${#GRADIENT[@]}

while true; do
  printf '\033[H'
  for ((y=0;y<LINES;y++)); do
    line=""
    for ((x=0;x<COLS;x++)); do
      v1=$(echo "s(($x+$T)*0.1)" | bc -l)
      v2=$(echo "s(($y+$T)*0.15)" | bc -l)
      v3=$(echo "s(($x+$y+$T)*0.08)" | bc -l)
      v=$(echo "scale=0; ($v1 + $v2 + $v3 + 3) * $GL / 6" | bc)
      (( v < 0 )) && v=0
      (( v >= GL )) && v=$((GL-1))
      line+="\033[48;5;${GRADIENT[$v]}m  "
    done
    printf '%b\033[0m\n' "$line"
  done
  printf '\033[38;5;205m🌈 BR-Plasma \033[38;5;69m[q=quit]\033[0m'
  T=$((T+1))
  read -rsn1 -t 0.05 K && [[ "$K" == "q" ]] && exit
done
