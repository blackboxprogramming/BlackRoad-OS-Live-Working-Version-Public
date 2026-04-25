#!/bin/bash
# BR-Vortex - Spinning vortex tunnel
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CX=$((COLS/2)) CY=$((LINES/2))
T=0
CHARS='·∘○◌◎●◉'
COLORS=(17 18 19 20 21 57 93 129 165 201 205 135 69)

while true; do
  printf '\033[2J\033[H'
  for ((r=1;r<=15;r++)); do
    points=$(( r * 6 ))
    spin=$(( T * (16-r) * 3 ))
    for ((p=0;p<points;p++)); do
      angle=$(( spin + p * 360 / points ))
      px=$(echo "scale=0; $CX + $r * 2 * c($angle * 0.0174)" | bc -l 2>/dev/null)
      py=$(echo "scale=0; $CY + $r * s($angle * 0.0174)" | bc -l 2>/dev/null)
      if [[ -n "$px" && -n "$py" ]] && (( px>0 && px<COLS && py>0 && py<LINES )); then
        ci=$(( r % ${#COLORS[@]} ))
        ch_i=$(( r * ${#CHARS[@]} / 16 ))
        (( ch_i >= ${#CHARS[@]} )) && ch_i=$((${#CHARS[@]}-1))
        ch=${CHARS:$ch_i:1}
        printf '\033[%d;%dH\033[38;5;%dm%s\033[0m' "$py" "$px" "${COLORS[$ci]}" "$ch"
      fi
    done
  done
  printf '\033[1;1H\033[38;5;135m◎ BR-Vortex \033[38;5;69m[q=quit]\033[0m'
  T=$((T+1))
  sleep 0.06
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
