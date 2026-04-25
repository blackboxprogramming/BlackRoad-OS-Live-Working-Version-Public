#!/bin/bash
# BR-Life - Conway's Game of Life
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
W=$(( $(tput cols) / 2 )) H=$(( $(tput lines) - 2 ))
(( W > 60 )) && W=60
(( H > 30 )) && H=30
declare -A grid next
GEN=0 POP=0

# Random seed
for ((y=0;y<H;y++)); do
  for ((x=0;x<W;x++)); do
    grid[$y,$x]=$(( RANDOM % 4 == 0 ? 1 : 0 ))
  done
done

while true; do
  POP=0
  output=""
  for ((y=0;y<H;y++)); do
    line=""
    for ((x=0;x<W;x++)); do
      # Count neighbors
      n=0
      for dy in -1 0 1; do
        for dx in -1 0 1; do
          (( dy == 0 && dx == 0 )) && continue
          ny=$(( (y+dy+H) % H )) nx=$(( (x+dx+W) % W ))
          (( n += grid[$ny,$nx] ))
        done
      done
      # Rules
      if (( grid[$y,$x] == 1 )); then
        (( n == 2 || n == 3 )) && next[$y,$x]=1 || next[$y,$x]=0
      else
        (( n == 3 )) && next[$y,$x]=1 || next[$y,$x]=0
      fi
      if (( next[$y,$x] )); then
        line+="\033[38;5;82m██"
        ((POP++))
      else
        line+="  "
      fi
    done
    output+="$line\033[0m\n"
  done

  printf '\033[H%b' "$output"
  printf '\033[38;5;205m🧬 BR-Life \033[38;5;69mGen:%d Pop:%d [q=quit]\033[0m' "$GEN" "$POP"

  # Copy next to grid
  for ((y=0;y<H;y++)); do
    for ((x=0;x<W;x++)); do
      grid[$y,$x]=${next[$y,$x]}
    done
  done
  ((GEN++))
  read -rsn1 -t 0.1 K && [[ "$K" == "q" ]] && exit
done
