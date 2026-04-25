#!/bin/bash
# BR-Pendulum - Double pendulum simulation
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CX=$((COLS/2)) CY=4
L1=8 L2=8
A1=314 A2=200 V1=0 V2=0
G=1 DT=3

while true; do
  printf '\033[2J\033[H'

  # Physics (simplified, integer-ish with bc)
  SA1=$(echo "s($A1/100)" | bc -l)
  CA1=$(echo "c($A1/100)" | bc -l)
  SA2=$(echo "s($A2/100)" | bc -l)
  CA2=$(echo "c($A2/100)" | bc -l)
  DA=$(echo "$A1/100 - $A2/100" | bc -l)
  SDA=$(echo "s($DA)" | bc -l)
  CDA=$(echo "c($DA)" | bc -l)

  ACC1=$(echo "scale=6; (-$G * 2 * $SA1 - $G * $SA2 * $CDA - $V2*$V2*$L2*$SDA - $V1*$V1*$L1*$SDA*$CDA) / ($L1 * (2 - $CDA*$CDA))" | bc -l 2>/dev/null || echo "0")
  ACC2=$(echo "scale=6; (2 * ($V1*$V1*$L1*$SDA + $G*$SA1*$CDA - $V2*$V2*$L2*$SDA*$CDA + $G*2*$SA2)) / ($L2 * (2 - $CDA*$CDA))" | bc -l 2>/dev/null || echo "0")

  V1=$(echo "$V1 + $ACC1 * $DT / 100" | bc -l)
  V2=$(echo "$V2 + $ACC2 * $DT / 100" | bc -l)
  A1=$(echo "scale=0; $A1 + $V1 * $DT" | bc)
  A2=$(echo "scale=0; $A2 + $V2 * $DT" | bc)

  # Positions
  X1=$(echo "scale=0; $CX + $L1 * 2 * $SA1" | bc)
  Y1=$(echo "scale=0; $CY + $L1 * $CA1" | bc)
  X2=$(echo "scale=0; $X1 + $L2 * 2 * $SA2" | bc)
  Y2=$(echo "scale=0; $Y1 + $L2 * $CA2" | bc)

  # Draw pivot
  printf '\033[%d;%dH\033[38;5;240m●\033[0m' "$CY" "$CX"

  # Draw arm 1
  [[ -n "$X1" && -n "$Y1" ]] && (( X1>0 && X1<COLS && Y1>0 && Y1<LINES )) && \
    printf '\033[%d;%dH\033[38;5;205m◉\033[0m' "$Y1" "$X1"

  # Draw arm 2
  [[ -n "$X2" && -n "$Y2" ]] && (( X2>0 && X2<COLS && Y2>0 && Y2<LINES )) && \
    printf '\033[%d;%dH\033[38;5;214m◉\033[0m' "$Y2" "$X2"

  # Draw lines (simple)
  printf '\033[%d;%dH\033[38;5;240m─\033[0m' "$(( (CY+Y1)/2 ))" "$(( (CX+X1)/2 ))"
  [[ -n "$X1" && -n "$Y1" && -n "$X2" && -n "$Y2" ]] && \
    printf '\033[%d;%dH\033[38;5;240m─\033[0m' "$(( (Y1+Y2)/2 ))" "$(( (X1+X2)/2 ))"

  printf '\033[1;1H\033[38;5;135m◎ BR-Pendulum \033[38;5;69m[q=quit]\033[0m'
  sleep 0.05
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
