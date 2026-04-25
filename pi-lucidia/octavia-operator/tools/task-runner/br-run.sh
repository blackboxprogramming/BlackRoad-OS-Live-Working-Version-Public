#!/bin/zsh
# BR Run - Smart Task Runner
AMBER='\033[38;5;214m'; PINK='\033[38;5;205m'; VIOLET='\033[38;5;135m'; BBLUE='\033[38;5;69m'
GREEN='\033[0;32m'; RED='\033[0;31m'; BOLD='\033[1m'; DIM='\033[2m'; NC='\033[0m'
CYAN="$AMBER"; YELLOW="$PINK"; BLUE="$BBLUE"; MAGENTA="$VIOLET"; PURPLE="$VIOLET"
BR_ROOT="${BR_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
RUN_HOME="${BR_ROOT}/tools/task-runner"

detect_tasks() {
    echo -e "${CYAN}🔍 Detecting tasks...${NC}\n"
    [[ -f "package.json" ]] && echo -e "${GREEN}📦 npm scripts${NC}" && jq -r '.scripts | keys[]' package.json 2>/dev/null | sed 's/^/  - npm run /'
    [[ -f "Makefile" ]] && echo -e "${GREEN}🔨 Makefile targets${NC}" && grep "^[a-zA-Z]" Makefile | sed 's/:.*//;s/^/  - make /'
    [[ -f "Cargo.toml" ]] && echo -e "${GREEN}🦀 Cargo commands${NC}" && echo "  - cargo build\n  - cargo test\n  - cargo run"
    [[ -f "go.mod" ]] && echo -e "${GREEN}🐹 Go commands${NC}" && echo "  - go build\n  - go test\n  - go run"
}

run_task() {
    local task=$1
    echo -e "${GREEN}▶️  Running: ${task}${NC}\n"
    eval $task
}

show_help() {
  echo -e ""
  echo -e "  ${AMBER}${BOLD}◆ BR RUN${NC}  ${DIM}Task automation that just runs.${NC}"
  echo -e "  ${DIM}Scripts, jobs, pipelines — go.${NC}"
  echo -e "  ${DIM}────────────────────────────────────────────────${NC}"
  echo -e "  ${BOLD}USAGE${NC}  br run ${DIM}<command>${NC}"
  echo -e ""
  echo -e "  ${BOLD}COMMANDS${NC}"
  echo -e "  ${AMBER}  detect                          ${NC} Auto-detect tasks (npm/make/cargo/go)"
  echo -e "  ${AMBER}  <task>                          ${NC} Execute any command as a named task"
  echo -e ""
  echo -e "  ${BOLD}EXAMPLES${NC}"
  echo -e "  ${DIM}  br run detect${NC}"
  echo -e "  ${DIM}  br run npm test${NC}"
  echo -e "  ${DIM}  br run make build${NC}"
  echo -e ""
}

case ${1:-detect} in
    detect|d) detect_tasks ;;
    help|-h|--help) show_help ;;
    *) run_task "$*" ;;
esac
