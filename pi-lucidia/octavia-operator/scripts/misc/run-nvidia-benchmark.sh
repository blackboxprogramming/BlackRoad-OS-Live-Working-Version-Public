#!/bin/bash
# BR-Benchmark - System and AI benchmark suite
PINK='\033[38;5;205m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
AMBER='\033[38;5;214m'
RESET='\033[0m'

clear
printf "${PINK}╔════════════════════════════════════════╗${RESET}\n"
printf "${PINK}║      ⚡  BR-Benchmark Suite  ⚡       ║${RESET}\n"
printf "${PINK}╚════════════════════════════════════════╝${RESET}\n\n"

# CPU Benchmark
printf "${BLUE}[CPU] Single-core benchmark...${RESET}\n"
START=$(python3 -c 'import time; print(time.time())')
python3 -c "
import math
s = 0
for i in range(1, 1000001):
    s += math.sqrt(i) * math.sin(i)
print(f'  Result: {s:.2f}')
"
END=$(python3 -c 'import time; print(time.time())')
ELAPSED=$(python3 -c "print(f'{$END - $START:.2f}')")
printf "  ${GREEN}Time: ${ELAPSED}s${RESET}\n\n"

# Memory Benchmark
printf "${BLUE}[MEM] Allocation test...${RESET}\n"
python3 -c "
import time
start = time.time()
data = bytearray(100 * 1024 * 1024)  # 100MB
for i in range(0, len(data), 4096):
    data[i] = 0xFF
elapsed = time.time() - start
print(f'  100MB alloc+write: {elapsed:.3f}s ({100/elapsed:.0f} MB/s)')
"
printf "\n"

# Disk Benchmark
printf "${BLUE}[DISK] Write speed...${RESET}\n"
dd if=/dev/zero of=/tmp/br-bench-test bs=1m count=256 2>&1 | tail -1 | awk '{print "  " $0}'
rm -f /tmp/br-bench-test
printf "\n"

# Network Benchmark
printf "${BLUE}[NET] Fleet latency...${RESET}\n"
for h in "alice:192.168.4.49" "cecilia:192.168.4.96" "octavia:192.168.4.100" "lucidia:192.168.4.38"; do
  name="${h%%:*}" ip="${h##*:}"
  ms=$(ping -c 3 -W 2 "$ip" 2>/dev/null | tail -1 | awk -F'/' '{print $5}')
  if [[ -n "$ms" ]]; then
    printf "  ${GREEN}%-10s${RESET} avg %sms\n" "$name" "$ms"
  else
    printf "  ${AMBER}%-10s${RESET} unreachable\n" "$name"
  fi
done
printf "\n"

# Ollama Benchmark (if available)
printf "${BLUE}[AI] Ollama inference test...${RESET}\n"
if curl -s --connect-timeout 2 http://localhost:11434/api/tags &>/dev/null; then
  START=$(python3 -c 'import time; print(time.time())')
  curl -s http://localhost:11434/api/generate -d '{"model":"llama3.2","prompt":"Say hello in one word","stream":false}' >/dev/null 2>&1
  END=$(python3 -c 'import time; print(time.time())')
  ELAPSED=$(python3 -c "print(f'{$END - $START:.2f}')")
  printf "  ${GREEN}Ollama response: ${ELAPSED}s${RESET}\n"
else
  printf "  ${AMBER}Ollama not running locally${RESET}\n"
fi

printf "\n${PINK}Benchmark complete.${RESET}\n"
read -rp "Press Enter to exit "
