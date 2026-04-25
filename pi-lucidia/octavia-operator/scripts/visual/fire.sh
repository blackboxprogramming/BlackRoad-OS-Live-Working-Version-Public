#!/bin/bash
# BR-Fire - Terminal fire effect
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(($(tput lines) - 1))
declare -a grid
SIZE=$((COLS * LINES))
for ((i=0;i<SIZE;i++)); do grid[$i]=0; done

FIRE_CHARS=(' ' '.' ':' '*' 'o' 'O' '#' '@')
FIRE_COLORS=(0 52 88 124 160 196 208 214 220 226 228 230 231)

while true; do
  # Set bottom row to random values
  for ((x=0;x<COLS;x++)); do
    grid[$(( (LINES-1)*COLS + x ))]=$(( RANDOM % 12 ))
  done

  # Propagate fire upward
  for ((y=LINES-2;y>=0;y--)); do
    for ((x=0;x<COLS;x++)); do
      idx=$((y*COLS+x))
      below=$(( (y+1)*COLS + x ))
      left=$(( (y+1)*COLS + (x>0 ? x-1 : 0) ))
      right=$(( (y+1)*COLS + (x<COLS-1 ? x+1 : x) ))
      avg=$(( (grid[below] + grid[left] + grid[right] + grid[$(( (y+2<LINES ? y+2 : y+1)*COLS + x ))]) / 4 ))
      decay=$(( RANDOM % 2 ))
      val=$((avg - decay))
      (( val < 0 )) && val=0
      grid[$idx]=$val
    done
  done

  # Render
  printf '\033[H'
  for ((y=0;y<LINES;y++)); do
    line=""
    for ((x=0;x<COLS;x++)); do
      v=${grid[$((y*COLS+x))]}
      if (( v == 0 )); then
        line+=' '
      else
        ci=$v
        (( ci >= ${#FIRE_COLORS[@]} )) && ci=$(( ${#FIRE_COLORS[@]} - 1 ))
        ch=$(( v * ${#FIRE_CHARS[@]} / 13 ))
        (( ch >= ${#FIRE_CHARS[@]} )) && ch=$(( ${#FIRE_CHARS[@]} - 1 ))
        line+="\033[38;5;${FIRE_COLORS[$ci]}m${FIRE_CHARS[$ch]}"
      fi
    done
    printf '%b\033[0m\n' "$line"
  done
  printf '\033[1;1H\033[38;5;214m🔥 BR-Fire \033[38;5;69m[q=quit]\033[0m'
  read -rsn1 -t 0.03 K && [[ "$K" == "q" ]] && exit
done
