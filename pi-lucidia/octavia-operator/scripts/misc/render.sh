#!/usr/bin/env bash

render_tile() {
  case "$1" in
    G) source assets/grass.tile ;;
    D) source assets/dirt.tile ;;
    R) source assets/road.tile ;;
    W) source assets/water.tile ;;
    H) source assets/house.tile ;;
    *) printf "\033[0m  " ;;
  esac
}

render_scene() {
  clear
  while read -r row; do
    for ((i=0;i<${#row};i++)); do
      render_tile "${row:i:1}"
    done
    printf "\033[0m\n"
  done
}
