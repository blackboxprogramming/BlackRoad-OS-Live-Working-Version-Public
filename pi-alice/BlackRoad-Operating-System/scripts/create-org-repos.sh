#!/bin/bash
#
# BlackRoad OS - Organization Repository Creator
# Creates all satellite repositories in the BlackRoad-OS organization
#
# Usage: ./scripts/create-org-repos.sh
#
# Prerequisites:
#   - gh CLI installed and authenticated
#   - Permission to create repos in BlackRoad-OS org
#
# Author: Cece (BlackRoad OS Engineer)
# Date: 2025-11-30
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Organization
ORG="BlackRoad-OS"

# Repository definitions: name|description|visibility
# Format: repo_name|description|public/private

AUTOMATION_LAYER=(
    "blackroad-os-beacon|Telemetry and observability service for BlackRoad OS|private"
    "blackroad-os-infra|Infrastructure as Code (IaC) for BlackRoad OS|private"
    "blackroad-os-archive|Append-only audit logs and compliance archive|private"
    "blackroad-os-master|Master controller and orchestration service|private"
    "blackroad-os-api-gateway|API gateway and rate limiting service|private"
)

PACK_LAYER=(
    "blackroad-os-pack-research-lab|R&D tools - math, quantum, experiments|private"
    "blackroad-os-pack-legal|Legal compliance and document management|private"
    "blackroad-os-pack-infra-devops|CI/CD and DevOps automation pack|private"
    "blackroad-os-pack-finance|Billing, invoicing, and financial tools|private"
    "blackroad-os-pack-education|Training, courses, and learning portal|private"
    "blackroad-os-pack-creator-studio|Design tools and creative studio|private"
)

INTELLIGENCE_LAYER=(
    "blackroad-os-agents|Agent manifests and orchestration configs|private"
    "blackroad-os-ideas|Idea backlog and feature tracking|private"
    "blackroad-os-research|Math research and computational notebooks|private"
)

BRAND_LAYER=(
    "blackroad-os-brand|Brand system, assets, and guidelines|private"
    "blackroad-os-home|Company handbook and internal docs|private"
    "blackroad-os-demo|Demo site and showcase|public"
)

# Template README content
generate_readme() {
    local repo_name=$1
    local description=$2

    cat << EOF
# ${repo_name}

> ${description}

**Part of [BlackRoad OS](https://github.com/BlackRoad-OS) - AI-powered operating system ecosystem**

---

## Overview

This repository is a satellite service of the BlackRoad OS ecosystem. It syncs from the main monorepo and deploys to Railway.

## Architecture

\`\`\`
BlackRoad-Operating-System (Monorepo)
    ↓ GitHub Actions Sync
${repo_name} (This Satellite)
    ↓ Railway Deploy
${repo_name}-production (Railway Service)
    ↓ Cloudflare DNS
*.blackroad.systems (Public)
\`\`\`

## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/${ORG}/${repo_name}.git
cd ${repo_name}

# Install dependencies
npm install  # or pip install -r requirements.txt

# Start development server
npm run dev  # or uvicorn app.main:app --reload
\`\`\`

## Kernel Integration

This service integrates with the BlackRoad OS Kernel for:
- Service Discovery
- Inter-Service RPC
- Event Bus
- State Management
- Structured Logging

See [Kernel Documentation](https://docs.blackroad.systems/kernel) for details.

## Environment Variables

\`\`\`bash
# Service Identity
SERVICE_NAME=${repo_name}
SERVICE_ROLE=<role>
ENVIRONMENT=production|development|staging|test
PORT=8000

# See .env.example for full configuration
\`\`\`

## Deployment

This repo auto-deploys to Railway when:
1. Code is synced from monorepo via GitHub Actions
2. Push to \`main\` branch triggers Railway deployment
3. Health checks pass

## Contributing

All changes should be made in the main monorepo:
\`blackboxprogramming/BlackRoad-Operating-System\`

Changes sync automatically to this satellite repo.

---

**BlackRoad OS** © 2025 Alexa Louise (Cadillac)
EOF
}

# Generate .gitignore
generate_gitignore() {
    cat << 'EOF'
# Dependencies
node_modules/
.venv/
venv/
__pycache__/
*.pyc

# Environment
.env
.env.local
.env.*.local

# Build output
dist/
build/
*.egg-info/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Testing
coverage/
.coverage
htmlcov/
.pytest_cache/

# Railway
.railway/
EOF
}

# Create a single repository
create_repo() {
    local repo_info=$1
    local repo_name=$(echo "$repo_info" | cut -d'|' -f1)
    local description=$(echo "$repo_info" | cut -d'|' -f2)
    local visibility=$(echo "$repo_info" | cut -d'|' -f3)

    echo -e "${CYAN}Creating repository: ${repo_name}${NC}"

    # Check if repo already exists
    if gh repo view "${ORG}/${repo_name}" &>/dev/null; then
        echo -e "${YELLOW}  ⚠ Repository already exists, skipping...${NC}"
        return 0
    fi

    # Create the repository
    gh repo create "${ORG}/${repo_name}" \
        --description "${description}" \
        --"${visibility}" \
        --add-readme=false \
        --clone=false

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Repository created${NC}"
    else
        echo -e "${RED}  ✗ Failed to create repository${NC}"
        return 1
    fi

    # Clone, add initial files, and push
    local temp_dir=$(mktemp -d)
    cd "$temp_dir"

    git clone "https://github.com/${ORG}/${repo_name}.git" 2>/dev/null || {
        # If clone fails (empty repo), initialize
        mkdir "$repo_name"
        cd "$repo_name"
        git init
        git remote add origin "https://github.com/${ORG}/${repo_name}.git"
    }

    cd "$repo_name" 2>/dev/null || true

    # Generate README
    generate_readme "$repo_name" "$description" > README.md

    # Generate .gitignore
    generate_gitignore > .gitignore

    # Create placeholder structure
    mkdir -p src docs tests

    # Create placeholder files
    echo "# Source code goes here" > src/.gitkeep
    echo "# Documentation goes here" > docs/.gitkeep
    echo "# Tests go here" > tests/.gitkeep

    # Commit and push
    git add -A
    git commit -m "feat: Initialize ${repo_name} satellite repository

Part of BlackRoad OS ecosystem.
Syncs from: blackboxprogramming/BlackRoad-Operating-System

🛣️ BlackRoad OS"

    git branch -M main
    git push -u origin main 2>/dev/null || git push --set-upstream origin main

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ Initial commit pushed${NC}"
    else
        echo -e "${YELLOW}  ⚠ Push may have failed (check manually)${NC}"
    fi

    # Cleanup
    cd /
    rm -rf "$temp_dir"

    echo ""
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     BlackRoad OS - Organization Repository Creator         ║${NC}"
    echo -e "${BLUE}║                                                            ║${NC}"
    echo -e "${BLUE}║     Creating 17 satellite repos in ${ORG}              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Check gh CLI
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}Error: gh CLI is not installed${NC}"
        echo "Install it from: https://cli.github.com/"
        exit 1
    fi

    # Check authentication
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}Error: gh CLI is not authenticated${NC}"
        echo "Run: gh auth login"
        exit 1
    fi

    echo -e "${GREEN}✓ gh CLI authenticated${NC}"
    echo ""

    # Create Automation Layer repos
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  AUTOMATION LAYER (5 repos)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    for repo in "${AUTOMATION_LAYER[@]}"; do
        create_repo "$repo"
    done

    # Create Pack Layer repos
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  PACK LAYER (6 repos)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    for repo in "${PACK_LAYER[@]}"; do
        create_repo "$repo"
    done

    # Create Intelligence Layer repos
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  INTELLIGENCE LAYER (3 repos)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    for repo in "${INTELLIGENCE_LAYER[@]}"; do
        create_repo "$repo"
    done

    # Create Brand Layer repos
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  BRAND LAYER (3 repos)${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    for repo in "${BRAND_LAYER[@]}"; do
        create_repo "$repo"
    done

    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    COMPLETE!                               ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  17 repositories created in ${ORG}                    ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║  Next steps:                                               ║${NC}"
    echo -e "${GREEN}║  1. Configure Railway services for each repo               ║${NC}"
    echo -e "${GREEN}║  2. Set up Cloudflare DNS CNAME records                    ║${NC}"
    echo -e "${GREEN}║  3. Add deploy keys for monorepo sync                      ║${NC}"
    echo -e "${GREEN}║  4. Configure GitHub Actions secrets                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
}

# Run main function
main "$@"
