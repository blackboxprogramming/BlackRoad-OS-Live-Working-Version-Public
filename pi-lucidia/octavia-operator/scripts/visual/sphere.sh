#!/bin/bash
# BR-Sphere - Rotating wireframe sphere
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(tput lines)
CX=$((COLS/2)) CY=$((LINES/2))
R=10
T=0
COLORS=(205 135 69 214 82)

while true; do
  printf '\033[2J\033[H'
  ROT=$(echo "$T * 0.05" | bc -l)
  SR=$(echo "s($ROT)" | bc -l)
  CR=$(echo "c($ROT)" | bc -l)

  # Latitude lines
  for lat in -60 -30 0 30 60; do
    for ((lon=0;lon<360;lon+=8)); do
      SLAT=$(echo "s($lat * 0.0174)" | bc -l)
      CLAT=$(echo "c($lat * 0.0174)" | bc -l)
      SLON=$(echo "s($lon * 0.0174)" | bc -l)
      CLON=$(echo "c($lon * 0.0174)" | bc -l)

      x=$(echo "$CLAT * $CLON" | bc -l)
      y=$SLAT
      z=$(echo "$CLAT * $SLON" | bc -l)

      # Rotate Y
      rx=$(echo "$x * $CR + $z * $SR" | bc -l)
      rz=$(echo "-$x * $SR + $z * $CR" | bc -l)

      # Project
      px=$(echo "scale=0; $CX + $rx * $R * 2" | bc)
      py=$(echo "scale=0; $CY + $y * $R" | bc)

      if [[ -n "$px" && -n "$py" ]] && (( px>0 && px<COLS && py>0 && py<LINES )); then
        # Depth shading
        if (( $(echo "$rz > 0" | bc -l) )); then
          printf '\033[%d;%dH\033[38;5;205m●\033[0m' "$py" "$px"
        else
          printf '\033[%d;%dH\033[38;5;240m·\033[0m' "$py" "$px"
        fi
      fi
    done
  done

  # Longitude lines
  for lon in 0 45 90 135; do
    for ((lat=-90;lat<=90;lat+=8)); do
      SLAT=$(echo "s($lat * 0.0174)" | bc -l)
      CLAT=$(echo "c($lat * 0.0174)" | bc -l)
      SLON=$(echo "s($lon * 0.0174)" | bc -l)
      CLON=$(echo "c($lon * 0.0174)" | bc -l)
      x=$(echo "$CLAT * $CLON" | bc -l)
      y=$SLAT
      z=$(echo "$CLAT * $SLON" | bc -l)
      rx=$(echo "$x * $CR + $z * $SR" | bc -l)
      rz=$(echo "-$x * $SR + $z * $CR" | bc -l)
      px=$(echo "scale=0; $CX + $rx * $R * 2" | bc)
      py=$(echo "scale=0; $CY + $y * $R" | bc)
      if [[ -n "$px" && -n "$py" ]] && (( px>0 && px<COLS && py>0 && py<LINES )); then
        if (( $(echo "$rz > 0" | bc -l) )); then
          printf '\033[%d;%dH\033[38;5;69m●\033[0m' "$py" "$px"
        else
          printf '\033[%d;%dH\033[38;5;237m·\033[0m' "$py" "$px"
        fi
      fi
    done
  done

  printf '\033[1;1H\033[38;5;135m◎ BR-Sphere \033[38;5;69m[q=quit]\033[0m'
  T=$((T+1))
  sleep 0.1
  read -rsn1 -t 0.01 K && [[ "$K" == "q" ]] && exit
done
