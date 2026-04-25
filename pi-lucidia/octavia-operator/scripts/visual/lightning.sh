#!/bin/bash
# BR-Lightning - Terminal lightning bolts
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
COLORS=(231 195 159 123 87 51 69)

strike() {
  local x=$(( RANDOM % (COLS-10) + 5 ))
  local y=1
  local color=${COLORS[$((RANDOM % ${#COLORS[@]}))]}

  while (( y < LINES - 1 )); do
    local branch=$(( RANDOM % 3 - 1 ))
    x=$((x + branch * 2))
    (( x < 2 )) && x=2
    (( x > COLS-2 )) && x=$((COLS-2))

    local ch='│'
    (( branch == -1 )) && ch='╲'
    (( branch == 1 )) && ch='╱'

    printf '\033[%d;%dH\033[1;38;5;%dm%s\033[0m' "$y" "$x" "$color" "$ch"

    # Random fork
    if (( RANDOM % 8 == 0 && y > 3 )); then
      local fx=$x fy=$y
      for ((f=0;f<$(( RANDOM % 4 + 2 ));f++)); do
        fb=$(( RANDOM % 3 - 1 ))
        fx=$((fx + fb * 2))
        ((fy++))
        (( fx > 1 && fx < COLS && fy < LINES )) && printf '\033[%d;%dH\033[38;5;123m·\033[0m' "$fy" "$fx"
      done
    fi
    ((y++))
    sleep 0.01
  done
  sleep 0.15

  # Flash
  printf '\033[H\033[48;5;231m'
  sleep 0.03
  printf '\033[0m'
}

while true; do
  printf '\033[2J\033[H'
  # Dark sky with clouds
  for ((i=0;i<8;i++)); do
    cx=$(( RANDOM % COLS ))
    printf '\033[1;%dH\033[38;5;240m░░░░░' "$cx"
    printf '\033[2;%dH\033[38;5;238m░░░░░░░' "$((cx-1))"
  done
  printf '\033[1;1H\033[38;5;205m⚡ BR-Lightning \033[38;5;69m[q=quit]\033[0m'

  sleep 0.$(( RANDOM % 8 + 2 ))
  strike
  sleep 0.$(( RANDOM % 5 + 2 ))

  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
