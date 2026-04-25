#!/bin/bash
# BR-Cube - Rotating 3D cube in terminal
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CX=$((COLS/2)) CY=$((LINES/2))
A=0 B=0
CHARS=(' ' '.' ':' '=' '#' '@')

while true; do
  printf '\033[H'
  SA=$(echo "s($A*0.05)" | bc -l)
  CA=$(echo "c($A*0.05)" | bc -l)
  SB=$(echo "s($B*0.05)" | bc -l)
  CB=$(echo "c($B*0.05)" | bc -l)

  # Draw cube edges
  for t in $(seq -1 1 0.15); do
    for s in -1 1; do
      # Front/back face horizontal
      X=$(echo "$t * $CA - $s * $SA" | bc -l)
      Y=$(echo "$t * $SA * $CB + $s * $CA * $CB" | bc -l)
      PX=$(echo "scale=0; $X * 12 + $CX" | bc)
      PY=$(echo "scale=0; $Y * 6 + $CY" | bc)
      [[ -n "$PX" && -n "$PY" ]] && printf '\033[%d;%dH\033[38;5;205m█\033[0m' "$PY" "$PX" 2>/dev/null
      # Top/bottom face
      X2=$(echo "$t * $CA - $s * $SA * $SB" | bc -l)
      Y2=$(echo "$s * $CB" | bc -l)
      PX2=$(echo "scale=0; $X2 * 12 + $CX" | bc)
      PY2=$(echo "scale=0; $Y2 * 6 + $CY" | bc)
      [[ -n "$PX2" && -n "$PY2" ]] && printf '\033[%d;%dH\033[38;5;69m█\033[0m' "$PY2" "$PX2" 2>/dev/null
    done
  done

  printf '\033[1;1H\033[38;5;214m⬡ BR-Cube \033[38;5;69m[q=quit]\033[0m'
  A=$((A+1)) B=$((B+1))
  sleep 0.08
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
  printf '\033[2J'
done
