#!/bin/bash
# BlackRoad README Enhancer — Production-level READMEs across all orgs
# Usage: ./enhance-all-readmes.sh [--dry-run] [--org ORG_NAME] [--limit N]
set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
GREEN='\033[38;5;82m'
VIOLET='\033[38;5;135m'
RED='\033[38;5;196m'
RESET='\033[0m'

DRY_RUN=false
TARGET_ORG=""
LIMIT=0
SKIP_EXISTING=false
LOG_DIR="$HOME/.blackroad-readme-enhance"
LOG_FILE="$LOG_DIR/enhance-$(date +%Y%m%d-%H%M%S).log"
ENHANCED=0
SKIPPED=0
FAILED=0
TOTAL=0

mkdir -p "$LOG_DIR"

usage() {
  echo "Usage: $0 [--dry-run] [--org ORG] [--limit N] [--skip-existing]"
  echo "  --dry-run        Show what would be done without pushing"
  echo "  --org ORG        Only process a specific org (or 'personal')"
  echo "  --limit N        Max repos to process (0=unlimited)"
  echo "  --skip-existing  Skip repos that already have a substantial README"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift;;
    --org) TARGET_ORG="$2"; shift 2;;
    --limit) LIMIT="$2"; shift 2;;
    --skip-existing) SKIP_EXISTING=true; shift;;
    --help|-h) usage;;
    *) echo "Unknown: $1"; exit 1;;
  esac
done

log() { echo -e "$1" | tee -a "$LOG_FILE"; }
log_plain() { echo "$1" >> "$LOG_FILE"; }

PERSONAL_USER="blackboxprogramming"
ALL_ORGS=(
  Blackbox-Enterprises
  BlackRoad-AI
  BlackRoad-OS
  BlackRoad-Labs
  BlackRoad-Cloud
  BlackRoad-Ventures
  BlackRoad-Foundation
  BlackRoad-Media
  BlackRoad-Hardware
  BlackRoad-Education
  BlackRoad-Gov
  BlackRoad-Security
  BlackRoad-Interactive
  BlackRoad-Archive
  BlackRoad-Studio
  BlackRoad-OS-Inc
)

# Map orgs to descriptions for README context
declare -A ORG_DESC
ORG_DESC[Blackbox-Enterprises]="Enterprise software and business operations"
ORG_DESC[BlackRoad-AI]="AI models, inference, and machine learning infrastructure"
ORG_DESC[BlackRoad-OS]="Core operating system components and utilities"
ORG_DESC[BlackRoad-Labs]="Research, experiments, and ML pipelines"
ORG_DESC[BlackRoad-Cloud]="Cloud infrastructure, Kubernetes, and deployment"
ORG_DESC[BlackRoad-Ventures]="Venture projects and startup tools"
ORG_DESC[BlackRoad-Foundation]="Open-source community and governance"
ORG_DESC[BlackRoad-Media]="Media, content, and creative tools"
ORG_DESC[BlackRoad-Hardware]="Hardware fleet, IoT, and device management"
ORG_DESC[BlackRoad-Education]="Education platform and learning tools"
ORG_DESC[BlackRoad-Gov]="Government and compliance tools"
ORG_DESC[BlackRoad-Security]="Security, identity, and threat intelligence"
ORG_DESC[BlackRoad-Interactive]="Interactive experiences and gaming"
ORG_DESC[BlackRoad-Archive]="Archived and legacy projects"
ORG_DESC[BlackRoad-Studio]="Creative studio and design tools"
ORG_DESC[BlackRoad-OS-Inc]="BlackRoad OS Inc. — core platform, agents, infrastructure"

# Detect project type from repo contents
detect_project_type() {
  local owner=$1 repo=$2
  local files
  files=$(gh api "repos/$owner/$repo/git/trees/HEAD?recursive=1" --jq '.tree[].path' 2>/dev/null | head -100)

  if echo "$files" | grep -q "package.json"; then
    if echo "$files" | grep -q "next.config"; then echo "nextjs"
    elif echo "$files" | grep -q "nuxt.config"; then echo "nuxt"
    elif echo "$files" | grep -qE "^src/.*\.tsx"; then echo "react"
    elif echo "$files" | grep -q "tsconfig.json"; then echo "typescript"
    else echo "node"
    fi
  elif echo "$files" | grep -q "Cargo.toml"; then echo "rust"
  elif echo "$files" | grep -q "go.mod"; then echo "go"
  elif echo "$files" | grep -qE "(setup\.py|pyproject\.toml|requirements\.txt)"; then
    if echo "$files" | grep -q "Dockerfile"; then echo "python-docker"
    else echo "python"
    fi
  elif echo "$files" | grep -q "wrangler.toml"; then echo "cloudflare-worker"
  elif echo "$files" | grep -q "Dockerfile"; then echo "docker"
  elif echo "$files" | grep -qE "\.sh$"; then echo "shell"
  elif echo "$files" | grep -q "\.github/"; then echo "github-meta"
  else echo "unknown"
  fi
}

# Get repo metadata
get_repo_meta() {
  local owner=$1 repo=$2
  gh api "repos/$owner/$repo" --jq '{
    description: .description,
    language: .language,
    topics: (.topics // []),
    license: (.license.spdx_id // "none"),
    has_pages: .has_pages,
    default_branch: .default_branch,
    homepage: (.homepage // ""),
    archived: .archived,
    fork: .fork,
    stars: .stargazers_count,
    created: .created_at,
    updated: .updated_at
  }' 2>/dev/null
}

# Check current README size
get_readme_size() {
  local owner=$1 repo=$2
  gh api "repos/$owner/$repo/readme" --jq '.size' 2>/dev/null || echo "0"
}

# Get current README content
get_readme_content() {
  local owner=$1 repo=$2
  gh api "repos/$owner/$repo/readme" --jq '.content' 2>/dev/null | base64 -d 2>/dev/null || echo ""
}

# Generate production README
generate_readme() {
  local owner=$1 repo=$2 proj_type=$3 meta=$4 org_context=$5

  local description=$(echo "$meta" | jq -r '.description // "A BlackRoad project"')
  local language=$(echo "$meta" | jq -r '.language // "Unknown"')
  local license=$(echo "$meta" | jq -r '.license // "none"')
  local homepage=$(echo "$meta" | jq -r '.homepage // ""')
  local default_branch=$(echo "$meta" | jq -r '.default_branch // "main"')
  local topics=$(echo "$meta" | jq -r '.topics | join(", ")' 2>/dev/null)

  # Badge URLs
  local badge_ci="![CI](https://github.com/$owner/$repo/actions/workflows/ci.yml/badge.svg)"
  local badge_license=""
  if [[ "$license" != "none" && "$license" != "null" ]]; then
    badge_license="![License: $license](https://img.shields.io/badge/license-${license}-blue.svg)"
  fi
  local badge_lang=""
  if [[ "$language" != "null" && "$language" != "Unknown" ]]; then
    badge_lang="![Language](https://img.shields.io/badge/lang-${language}-informational)"
  fi

  # Install/usage based on project type
  local install_section=""
  local usage_section=""
  local tech_stack=""

  case "$proj_type" in
    nextjs)
      tech_stack="Next.js, React, TypeScript"
      install_section='```bash
npm install
```'
      usage_section='```bash
# Development
npm run dev

# Production build
npm run build && npm start
```'
      ;;
    react|typescript)
      tech_stack="React, TypeScript"
      install_section='```bash
npm install
```'
      usage_section='```bash
npm run dev
npm run build
npm test
```'
      ;;
    node)
      tech_stack="Node.js"
      install_section='```bash
npm install
```'
      usage_section='```bash
npm start
npm test
```'
      ;;
    python|python-docker)
      tech_stack="Python"
      install_section='```bash
pip install -r requirements.txt
```'
      usage_section='```bash
python main.py
```'
      if [[ "$proj_type" == "python-docker" ]]; then
        tech_stack="Python, Docker"
        usage_section='```bash
# Local
python main.py

# Docker
docker build -t '"$repo"' .
docker run -p 8000:8000 '"$repo"'
```'
      fi
      ;;
    rust)
      tech_stack="Rust"
      install_section='```bash
cargo build --release
```'
      usage_section='```bash
cargo run
cargo test
```'
      ;;
    go)
      tech_stack="Go"
      install_section='```bash
go mod download
go build ./...
```'
      usage_section='```bash
go run .
go test ./...
```'
      ;;
    cloudflare-worker)
      tech_stack="Cloudflare Workers, TypeScript"
      install_section='```bash
npm install
```'
      usage_section='```bash
# Development
npm run dev

# Deploy
npm run deploy
```'
      ;;
    docker)
      tech_stack="Docker"
      install_section='```bash
docker build -t '"$repo"' .
```'
      usage_section='```bash
docker run '"$repo"'
```'
      ;;
    shell)
      tech_stack="Bash"
      install_section='```bash
chmod +x *.sh
```'
      usage_section='```bash
./script-name.sh
```'
      ;;
    github-meta)
      # .github repos get a minimal README
      cat <<METAEOF
# $repo

$description

This repository contains organization-wide configuration, community health files, and GitHub profile for **$owner**.

## Contents

- \`profile/README.md\` — Organization profile displayed on GitHub
- \`.github/\` — Shared workflows, issue templates, and community health files

## Part of [BlackRoad OS](https://blackroad.io)

Built by [BlackRoad OS, Inc.](https://github.com/BlackRoad-OS-Inc)
METAEOF
      return
      ;;
    *)
      tech_stack="$language"
      install_section='See project documentation for setup instructions.'
      usage_section='See project documentation for usage.'
      ;;
  esac

  # Build the README
  cat <<EOF
# $repo

$description

$badge_ci $badge_license $badge_lang

## Overview

**$repo** is part of the [$owner](https://github.com/$owner) organization — $org_context.

$(if [[ -n "$tech_stack" && "$tech_stack" != "null" ]]; then echo "**Tech Stack:** $tech_stack"; fi)
$(if [[ -n "$topics" ]]; then echo "**Topics:** $topics"; fi)

## Getting Started

### Prerequisites

$(case "$proj_type" in
  nextjs|react|typescript|node|cloudflare-worker) echo "- Node.js >= 18
- npm or yarn";;
  python|python-docker) echo "- Python >= 3.10
- pip";;
  rust) echo "- Rust (latest stable)
- Cargo";;
  go) echo "- Go >= 1.21";;
  docker|python-docker) echo "- Docker >= 24.0";;
  shell) echo "- Bash >= 4.0";;
  *) echo "- See project files for requirements";;
esac)

### Installation

$install_section

## Usage

$usage_section

## Project Structure

\`\`\`
$repo/
├── README.md
$(case "$proj_type" in
  nextjs) echo "├── src/              # Application source
├── public/           # Static assets
├── next.config.js    # Next.js configuration
└── package.json      # Dependencies";;
  react|typescript) echo "├── src/              # Source code
├── tsconfig.json     # TypeScript config
└── package.json      # Dependencies";;
  node) echo "├── src/              # Source code
├── test/             # Tests
└── package.json      # Dependencies";;
  python|python-docker) echo "├── src/              # Source code
├── tests/            # Tests
├── requirements.txt  # Dependencies
└── setup.py          # Package config";;
  rust) echo "├── src/              # Source code
├── tests/            # Tests
└── Cargo.toml        # Dependencies";;
  go) echo "├── cmd/              # Entry points
├── pkg/              # Library code
└── go.mod            # Dependencies";;
  cloudflare-worker) echo "├── src/              # Worker source
├── wrangler.toml     # Wrangler config
└── package.json      # Dependencies";;
  shell) echo "├── *.sh              # Shell scripts
└── README.md         # Documentation";;
  *) echo "└── ...               # Project files";;
esac)
\`\`\`

## Development

\`\`\`bash
# Clone the repository
git clone https://github.com/$owner/$repo.git
cd $repo

$(case "$proj_type" in
  nextjs|react|typescript|node|cloudflare-worker) echo "# Install dependencies
npm install

# Run tests
npm test

# Lint
npm run lint";;
  python|python-docker) echo "# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest";;
  rust) echo "# Build
cargo build

# Run tests
cargo test

# Lint
cargo clippy";;
  go) echo "# Build
go build ./...

# Run tests
go test ./...

# Lint
golangci-lint run";;
  *) echo "# See project documentation";;
esac)
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/your-feature\`)
3. Commit your changes (\`git commit -m 'feat: add your feature'\`)
4. Push to the branch (\`git push origin feature/your-feature\`)
5. Open a Pull Request

## License

$(if [[ "$license" != "none" && "$license" != "null" ]]; then
  echo "This project is licensed under the $license License — see the [LICENSE](LICENSE) file for details."
else
  echo "Copyright $(date +%Y) BlackRoad OS, Inc. All rights reserved."
fi)

---

**[BlackRoad OS](https://blackroad.io)** — Built by [BlackRoad OS, Inc.](https://github.com/BlackRoad-OS-Inc)$(if [[ -n "$homepage" && "$homepage" != "null" ]]; then echo " | [Homepage]($homepage)"; fi)
EOF
}

# Push README to repo
push_readme() {
  local owner=$1 repo=$2 content=$3 default_branch=$4

  # Get current README SHA (if exists)
  local sha
  sha=$(gh api "repos/$owner/$repo/readme" --jq '.sha' 2>/dev/null || echo "")

  local encoded
  encoded=$(echo "$content" | base64)

  local message="docs: enhance README to production standard"

  if [[ -n "$sha" ]]; then
    gh api "repos/$owner/$repo/contents/README.md" \
      -X PUT \
      -f message="$message" \
      -f content="$encoded" \
      -f sha="$sha" \
      -f branch="$default_branch" \
      --silent 2>/dev/null
  else
    gh api "repos/$owner/$repo/contents/README.md" \
      -X PUT \
      -f message="$message" \
      -f content="$encoded" \
      -f branch="$default_branch" \
      --silent 2>/dev/null
  fi
}

# Process a single repo
process_repo() {
  local owner=$1 repo=$2 org_context=$3
  TOTAL=$((TOTAL + 1))

  # Skip .github profile repos from full enhancement
  if [[ "$repo" == ".github" ]]; then
    log "  ${VIOLET}SKIP${RESET} $owner/$repo (org profile)"
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  # Skip github.io pages repos
  if [[ "$repo" == *".github.io" ]]; then
    log "  ${VIOLET}SKIP${RESET} $owner/$repo (pages site)"
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  # Get repo metadata
  local meta
  meta=$(get_repo_meta "$owner" "$repo")
  if [[ -z "$meta" ]]; then
    log "  ${RED}FAIL${RESET} $owner/$repo (can't read metadata)"
    FAILED=$((FAILED + 1))
    return
  fi

  # Skip archived/forked repos
  local archived=$(echo "$meta" | jq -r '.archived')
  local fork=$(echo "$meta" | jq -r '.fork')
  if [[ "$archived" == "true" ]]; then
    log "  ${VIOLET}SKIP${RESET} $owner/$repo (archived)"
    SKIPPED=$((SKIPPED + 1))
    return
  fi
  if [[ "$fork" == "true" ]]; then
    log "  ${VIOLET}SKIP${RESET} $owner/$repo (fork)"
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  # Check existing README
  if [[ "$SKIP_EXISTING" == "true" ]]; then
    local readme_size
    readme_size=$(get_readme_size "$owner" "$repo")
    if [[ "$readme_size" -gt 2000 ]]; then
      log "  ${VIOLET}SKIP${RESET} $owner/$repo (README already ${readme_size}B)"
      SKIPPED=$((SKIPPED + 1))
      return
    fi
  fi

  # Detect project type
  local proj_type
  proj_type=$(detect_project_type "$owner" "$repo")

  local default_branch=$(echo "$meta" | jq -r '.default_branch // "main"')

  # Generate README
  local readme_content
  readme_content=$(generate_readme "$owner" "$repo" "$proj_type" "$meta" "$org_context")

  if [[ "$DRY_RUN" == "true" ]]; then
    log "  ${BLUE}DRY${RESET} $owner/$repo (${proj_type}) — would enhance"
    log_plain "--- $owner/$repo ---"
    log_plain "$readme_content"
    log_plain "--- end ---"
  else
    if push_readme "$owner" "$repo" "$readme_content" "$default_branch"; then
      log "  ${GREEN}DONE${RESET} $owner/$repo (${proj_type})"
      ENHANCED=$((ENHANCED + 1))
    else
      log "  ${RED}FAIL${RESET} $owner/$repo (push failed)"
      FAILED=$((FAILED + 1))
    fi
  fi

  # Rate limiting — GitHub API allows 5000/hr, be safe
  sleep 1
}

# Process all repos for an owner
process_owner() {
  local owner=$1 org_context=$2 is_personal=$3

  log "${PINK}━━━ Processing $owner ━━━${RESET}"

  local repos
  if [[ "$is_personal" == "true" ]]; then
    repos=$(gh repo list "$owner" --limit 1000 --json name --jq '.[].name' 2>/dev/null)
  else
    repos=$(gh repo list "$owner" --limit 1000 --json name --jq '.[].name' 2>/dev/null)
  fi

  local count=$(echo "$repos" | wc -l | tr -d ' ')
  log "${AMBER}  Found $count repos${RESET}"

  local processed=0
  while IFS= read -r repo; do
    [[ -z "$repo" ]] && continue
    if [[ "$LIMIT" -gt 0 && "$TOTAL" -ge "$LIMIT" ]]; then
      log "${AMBER}  Limit reached ($LIMIT)${RESET}"
      break
    fi
    process_repo "$owner" "$repo" "$org_context"
    processed=$((processed + 1))
  done <<< "$repos"
}

# ============================================================
log "${PINK}╔════════════════════════════════════════════════╗${RESET}"
log "${PINK}║   BlackRoad README Enhancer — Production Mode  ║${RESET}"
log "${PINK}╚════════════════════════════════════════════════╝${RESET}"
log ""
log "Mode: $(if $DRY_RUN; then echo "${AMBER}DRY RUN${RESET}"; else echo "${GREEN}LIVE${RESET}"; fi)"
log "Target: $(if [[ -n "$TARGET_ORG" ]]; then echo "$TARGET_ORG"; else echo "ALL orgs + personal"; fi)"
log "Limit: $(if [[ "$LIMIT" -gt 0 ]]; then echo "$LIMIT"; else echo "unlimited"; fi)"
log "Log: $LOG_FILE"
log ""

if [[ -n "$TARGET_ORG" ]]; then
  if [[ "$TARGET_ORG" == "personal" ]]; then
    process_owner "$PERSONAL_USER" "Personal projects by Alexa" "true"
  else
    process_owner "$TARGET_ORG" "${ORG_DESC[$TARGET_ORG]:-BlackRoad project}" "false"
  fi
else
  # Process all orgs
  for org in "${ALL_ORGS[@]}"; do
    if [[ "$LIMIT" -gt 0 && "$TOTAL" -ge "$LIMIT" ]]; then break; fi
    process_owner "$org" "${ORG_DESC[$org]}" "false"
  done
  # Process personal
  if [[ "$LIMIT" -eq 0 || "$TOTAL" -lt "$LIMIT" ]]; then
    process_owner "$PERSONAL_USER" "Personal projects by Alexa" "true"
  fi
fi

log ""
log "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
log "${GREEN}Enhanced:${RESET} $ENHANCED"
log "${VIOLET}Skipped:${RESET}  $SKIPPED"
log "${RED}Failed:${RESET}   $FAILED"
log "Total:    $TOTAL"
log "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
log "Full log: $LOG_FILE"
