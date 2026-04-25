#!/bin/bash
# BR-Matrix - Digital rain (Matrix effect)
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CHARS='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF'
declare -a drops speed
for ((i=0;i<COLS;i++)); do
  drops[$i]=$(( RANDOM % LINES ))
  speed[$i]=$(( RANDOM % 3 + 1 ))
done

while true; do
  for ((x=0;x<COLS;x+=2)); do
    y=${drops[$x]}
    sp=${speed[$x]}

    # Draw bright head
    ch=${CHARS:$((RANDOM % ${#CHARS})):1}
    printf '\033[%d;%dH\033[1;38;5;231m%s\033[0m' "$y" "$((x+1))" "$ch"

    # Dim trail
    if (( y > 1 )); then
      ch2=${CHARS:$((RANDOM % ${#CHARS})):1}
      printf '\033[%d;%dH\033[38;5;82m%s\033[0m' "$((y-1))" "$((x+1))" "$ch2"
    fi
    if (( y > 3 )); then
      ch3=${CHARS:$((RANDOM % ${#CHARS})):1}
      printf '\033[%d;%dH\033[38;5;22m%s\033[0m' "$((y-3))" "$((x+1))" "$ch3"
    fi
    # Erase tail
    if (( y > 8 )); then
      printf '\033[%d;%dH \033[0m' "$((y-8))" "$((x+1))"
    fi

    drops[$x]=$(( y + sp ))
    if (( drops[$x] > LINES + 10 )); then
      drops[$x]=0
      speed[$x]=$(( RANDOM % 3 + 1 ))
    fi
  done
  printf '\033[1;1H\033[1;38;5;82m⬡ BR-Matrix \033[38;5;69m[q=quit]\033[0m'
  sleep 0.04
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
