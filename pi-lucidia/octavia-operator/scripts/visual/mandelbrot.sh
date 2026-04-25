#!/bin/bash
# BR-Mandelbrot - Terminal Mandelbrot set renderer
clear
trap 'printf "\033[?25h\033[0m"; clear; exit' INT TERM EXIT
printf '\033[?25l'
COLS=$(tput cols) LINES=$(($(tput lines) - 2))
CHARS=' .:-=+*#%@█'
COLORS=(0 17 18 19 20 21 57 93 129 165 201 200 199 198 197 196 202 208 214 220 226 190 154 118 82 46 47 48 49 50 51)
MAX_ITER=30
CX=-0.5 CY=0 ZOOM=1.5

render() {
  printf '\033[H'
  for ((py=0;py<LINES;py++)); do
    line=""
    for ((px=0;px<COLS;px++)); do
      x0=$(echo "scale=10; ($px - $COLS/2) * $ZOOM * 3.5 / $COLS + $CX" | bc -l)
      y0=$(echo "scale=10; ($py - $LINES/2) * $ZOOM * 2.0 / $LINES + $CY" | bc -l)
      x=0 y=0 iter=0
      while (( iter < MAX_ITER )); do
        x2=$(echo "scale=10; $x * $x" | bc -l)
        y2=$(echo "scale=10; $y * $y" | bc -l)
        mag=$(echo "$x2 + $y2" | bc -l)
        if (( $(echo "$mag > 4" | bc -l) )); then break; fi
        xn=$(echo "scale=10; $x2 - $y2 + $x0" | bc -l)
        y=$(echo "scale=10; 2 * $x * $y + $y0" | bc -l)
        x=$xn
        ((iter++))
      done
      if (( iter == MAX_ITER )); then
        line+=' '
      else
        ci=$(( iter % ${#COLORS[@]} ))
        line+="\033[38;5;${COLORS[$ci]}m█"
      fi
    done
    printf '%b\033[0m\n' "$line"
  done
  printf '\033[38;5;205m🔮 BR-Mandelbrot \033[38;5;69mZoom:%.2f [+/-/arrows/q]\033[0m' "$ZOOM"
}

render
while true; do
  read -rsn1 K
  if [[ "$K" == $'\033' ]]; then
    read -rsn2 -t 0.01 SEQ
    case "$SEQ" in
      '[A') CY=$(echo "$CY - 0.1 * $ZOOM" | bc -l);;
      '[B') CY=$(echo "$CY + 0.1 * $ZOOM" | bc -l);;
      '[C') CX=$(echo "$CX + 0.1 * $ZOOM" | bc -l);;
      '[D') CX=$(echo "$CX - 0.1 * $ZOOM" | bc -l);;
    esac
    render
  elif [[ "$K" == "+" || "$K" == "=" ]]; then
    ZOOM=$(echo "$ZOOM * 0.7" | bc -l); render
  elif [[ "$K" == "-" ]]; then
    ZOOM=$(echo "$ZOOM * 1.4" | bc -l); render
  elif [[ "$K" == "q" ]]; then exit
  fi
done
