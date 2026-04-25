#!/bin/bash

clear
printf '⬜%.0s' {1..255}
echo
for ((i=1; i<255; i++)); do
  printf '⬜%.0s' {1..255}
  echo
done
