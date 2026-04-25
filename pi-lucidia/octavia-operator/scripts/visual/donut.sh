#!/bin/bash
# BR-Donut - Spinning donut (inspired by donut.c)
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
W=$((COLS > 80 ? 80 : COLS))
H=$((LINES > 24 ? 24 : LINES - 2))

A=0
while true; do
  output=""
  declare -a buf zbuf
  for ((i=0;i<W*H;i++)); do buf[$i]=' '; zbuf[$i]=0; done

  j=0
  while (( j < 628 )); do
    i=0
    while (( i < 628 )); do
      SI=$(echo "s($i/100)" | bc -l)
      CI=$(echo "c($i/100)" | bc -l)
      SJ=$(echo "s($j/100)" | bc -l)
      CJ=$(echo "c($j/100)" | bc -l)
      SA=$(echo "s($A/100)" | bc -l)
      CA=$(echo "c($A/100)" | bc -l)

      H2=$(echo "$CJ + 2" | bc -l)
      D=$(echo "1 / ($SI * $H2 * $SA + $SJ * $CA + 5)" | bc -l)
      T=$(echo "$SI * $H2 * $CA - $SJ * $SA" | bc -l)

      X=$(echo "scale=0; $W/2 + $W/3 * $D * ($CI * $H2 * $CA - $T * 0)" | bc 2>/dev/null)
      Y=$(echo "scale=0; $H/2 + $H/3 * $D * ($CI * $H2 * $SA + $SJ * $CA)" | bc 2>/dev/null)

      if [[ -n "$X" && -n "$Y" ]] && (( X >= 0 && X < W && Y >= 0 && Y < H )); then
        L=$(echo "scale=0; 8 * ($SJ * $SA - $SI * $CJ * $CA) * $D" | bc 2>/dev/null)
        (( L < 0 )) && L=0
        IDX=$((Y*W+X))
        DINT=$(echo "scale=0; $D * 10000" | bc 2>/dev/null)
        if (( DINT > zbuf[IDX] )); then
          zbuf[$IDX]=$DINT
          CHARS=".,-~:;=!*#$@"
          (( L > 11 )) && L=11
          (( L < 0 )) && L=0
          buf[$IDX]=${CHARS:$L:1}
        fi
      fi
      i=$((i+40))
    done
    j=$((j+40))
  done

  printf '\033[H\033[38;5;205m'
  for ((y=0;y<H;y++)); do
    line=""
    for ((x=0;x<W;x++)); do
      line+="${buf[$((y*W+x))]}"
    done
    echo "$line"
  done
  printf '\033[38;5;69m🍩 BR-Donut [q=quit]\033[0m'

  A=$((A+4))
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
