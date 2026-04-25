#!/bin/bash
# BR-Snake - Terminal snake game
# Usage: ./snake.sh

clear
COLS=$(tput cols) LINES=$(tput lines)
W=$((COLS > 40 ? 40 : COLS - 2))
H=$((LINES > 20 ? 20 : LINES - 2))

declare -a SX SY
SX=($(( W/2 )) $(( W/2-1 )) $(( W/2-2 )))
SY=($(( H/2 )) $(( H/2 )) $(( H/2 )))
LEN=3 DIR=0 SCORE=0
FX=$(( RANDOM % (W-2) + 1 )) FY=$(( RANDOM % (H-2) + 1 ))

draw_border() {
  printf '\033[H\033[38;5;205m'
  for ((i=0;i<=W;i++)); do printf '█'; done; echo
  for ((j=1;j<H;j++)); do
    printf '\033[%d;1H█\033[%d;%dH█' $((j+1)) $((j+1)) $((W+1))
  done
  printf '\033[%d;1H' $((H+1))
  for ((i=0;i<=W;i++)); do printf '█'; done
  printf '\033[0m'
}

place_food() {
  FX=$(( RANDOM % (W-2) + 2 )) FY=$(( RANDOM % (H-2) + 2 ))
  printf '\033[%d;%dH\033[38;5;214m●\033[0m' "$FY" "$FX"
}

stty -echo -icanon min 0 time 0
trap 'stty sane; printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
draw_border
place_food

DX=(1 0 -1 0) DY=(0 1 0 -1)

while true; do
  read -rsn1 -t 0.1 KEY
  if [[ "$KEY" == $'\033' ]]; then
    read -rsn2 -t 0.01 SEQ
    case "$SEQ" in
      '[A') [[ $DIR != 1 ]] && DIR=3;;
      '[B') [[ $DIR != 3 ]] && DIR=1;;
      '[C') [[ $DIR != 2 ]] && DIR=0;;
      '[D') [[ $DIR != 0 ]] && DIR=2;;
    esac
  elif [[ "$KEY" == "q" ]]; then exit; fi

  # Erase tail
  printf '\033[%d;%dH ' "${SY[$((LEN-1))]}" "${SX[$((LEN-1))]}"

  # Shift body
  for ((i=LEN-1;i>0;i--)); do
    SX[$i]=${SX[$((i-1))]}
    SY[$i]=${SY[$((i-1))]}
  done

  # Move head
  SX[0]=$(( SX[0] + DX[DIR] ))
  SY[0]=$(( SY[0] + DY[DIR] ))

  # Wall collision
  if (( SX[0] <= 1 || SX[0] >= W || SY[0] <= 1 || SY[0] >= H )); then
    printf '\033[%d;1H\033[38;5;205mGAME OVER! Score: %d\033[0m\n' $((H+2)) $SCORE
    read -rsn1; exit
  fi

  # Self collision
  for ((i=1;i<LEN;i++)); do
    if (( SX[0]==SX[i] && SY[0]==SY[i] )); then
      printf '\033[%d;1H\033[38;5;205mGAME OVER! Score: %d\033[0m\n' $((H+2)) $SCORE
      read -rsn1; exit
    fi
  done

  # Food
  if (( SX[0]==FX && SY[0]==FY )); then
    ((LEN++)); ((SCORE+=10))
    SX+=("${SX[$((LEN-2))]}"); SY+=("${SY[$((LEN-2))]}")
    place_food
  fi

  # Draw head
  printf '\033[%d;%dH\033[38;5;82m█\033[0m' "${SY[0]}" "${SX[0]}"
  # Score
  printf '\033[%d;1H\033[38;5;69mScore: %d\033[0m' $((H+2)) $SCORE
done
