#!/bin/bash
#
# BlackRoad OS - Organization Repository Creator (API Version)
# Creates all satellite repositories using GitHub REST API
#
# Usage:
#   GITHUB_TOKEN=ghp_xxx ./scripts/create-org-repos-api.sh
#   or
#   ./scripts/create-org-repos-api.sh <github_token>
#
# Author: Cece (BlackRoad OS Engineer)
# Date: 2025-11-30
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# GitHub API
API_URL="https://api.github.com"
ORG="BlackRoad-OS"

# Get token from arg or env
TOKEN="${1:-$GITHUB_TOKEN}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Error: GitHub token required${NC}"
    echo ""
    echo "Usage:"
    echo "  GITHUB_TOKEN=ghp_xxx ./scripts/create-org-repos-api.sh"
    echo "  or"
    echo "  ./scripts/create-org-repos-api.sh ghp_xxx"
    echo ""
    echo "Create a token at: https://github.com/settings/tokens"
    echo "Required scopes: repo, admin:org"
    exit 1
fi

# Repository definitions
declare -A REPOS=(
    # Automation Layer
    ["blackroad-os-beacon"]="Telemetry and observability service for BlackRoad OS|private"
    ["blackroad-os-infra"]="Infrastructure as Code (IaC) for BlackRoad OS|private"
    ["blackroad-os-archive"]="Append-only audit logs and compliance archive|private"
    ["blackroad-os-master"]="Master controller and orchestration service|private"
    ["blackroad-os-api-gateway"]="API gateway and rate limiting service|private"
    # Pack Layer
    ["blackroad-os-pack-research-lab"]="R&D tools - math, quantum, experiments|private"
    ["blackroad-os-pack-legal"]="Legal compliance and document management|private"
    ["blackroad-os-pack-infra-devops"]="CI/CD and DevOps automation pack|private"
    ["blackroad-os-pack-finance"]="Billing, invoicing, and financial tools|private"
    ["blackroad-os-pack-education"]="Training, courses, and learning portal|private"
    ["blackroad-os-pack-creator-studio"]="Design tools and creative studio|private"
    # Intelligence Layer
    ["blackroad-os-agents"]="Agent manifests and orchestration configs|private"
    ["blackroad-os-ideas"]="Idea backlog and feature tracking|private"
    ["blackroad-os-research"]="Math research and computational notebooks|private"
    # Brand Layer
    ["blackroad-os-brand"]="Brand system, assets, and guidelines|private"
    ["blackroad-os-home"]="Company handbook and internal docs|private"
    ["blackroad-os-demo"]="Demo site and showcase|public"
)

# Generate README content
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

\\\`\\\`\\\`
BlackRoad-Operating-System (Monorepo)
    ↓ GitHub Actions Sync
${repo_name} (This Satellite)
    ↓ Railway Deploy
${repo_name}-production (Railway Service)
    ↓ Cloudflare DNS
*.blackroad.systems (Public)
\\\`\\\`\\\`

## Quick Start

\\\`\\\`\\\`bash
git clone https://github.com/${ORG}/${repo_name}.git
cd ${repo_name}
\\\`\\\`\\\`

## Kernel Integration

This service integrates with the BlackRoad OS Kernel.
See [Kernel Documentation](https://docs.blackroad.systems/kernel) for details.

---

**BlackRoad OS** © 2025 Alexa Louise (Cadillac)
EOF
}

# Create repository via API
create_repo() {
    local repo_name=$1
    local info=${REPOS[$repo_name]}
    local description=$(echo "$info" | cut -d'|' -f1)
    local visibility=$(echo "$info" | cut -d'|' -f2)
    local is_private="true"
    [ "$visibility" = "public" ] && is_private="false"

    echo -e "${CYAN}Creating: ${repo_name}${NC}"

    # Check if exists
    local check=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Accept: application/vnd.github+json" \
        "$API_URL/repos/$ORG/$repo_name")

    if [ "$check" = "200" ]; then
        echo -e "${YELLOW}  ⚠ Already exists, skipping creation${NC}"
    else
        # Create the repo
        local response=$(curl -s -X POST \
            -H "Authorization: Bearer $TOKEN" \
            -H "Accept: application/vnd.github+json" \
            "$API_URL/orgs/$ORG/repos" \
            -d "{
                \"name\": \"$repo_name\",
                \"description\": \"$description\",
                \"private\": $is_private,
                \"auto_init\": false,
                \"has_issues\": true,
                \"has_projects\": true,
                \"has_wiki\": false
            }")

        if echo "$response" | grep -q "\"full_name\""; then
            echo -e "${GREEN}  ✓ Repository created${NC}"
        else
            echo -e "${RED}  ✗ Failed: $(echo "$response" | grep -o '"message":"[^"]*"' | head -1)${NC}"
            return 1
        fi
    fi

    # Add README via API
    local readme_content=$(generate_readme "$repo_name" "$description" | base64 -w 0)

    local readme_response=$(curl -s -X PUT \
        -H "Authorization: Bearer $TOKEN" \
        -H "Accept: application/vnd.github+json" \
        "$API_URL/repos/$ORG/$repo_name/contents/README.md" \
        -d "{
            \"message\": \"feat: Initialize ${repo_name} satellite repository\",
            \"content\": \"$readme_content\",
            \"branch\": \"main\"
        }")

    if echo "$readme_response" | grep -q "\"content\""; then
        echo -e "${GREEN}  ✓ README added${NC}"
    elif echo "$readme_response" | grep -q "sha"; then
        echo -e "${YELLOW}  ⚠ README exists${NC}"
    else
        echo -e "${YELLOW}  ⚠ README may need manual creation${NC}"
    fi

    # Add .gitignore
    local gitignore_content=$(cat << 'GITIGNORE'
# Dependencies
node_modules/
.venv/
__pycache__/

# Environment
.env
.env.local

# Build
dist/
build/

# IDE
.idea/
.vscode/

# OS
.DS_Store

# Logs
*.log
GITIGNORE
)
    local gitignore_b64=$(echo "$gitignore_content" | base64 -w 0)

    curl -s -X PUT \
        -H "Authorization: Bearer $TOKEN" \
        -H "Accept: application/vnd.github+json" \
        "$API_URL/repos/$ORG/$repo_name/contents/.gitignore" \
        -d "{
            \"message\": \"chore: Add .gitignore\",
            \"content\": \"$gitignore_b64\",
            \"branch\": \"main\"
        }" > /dev/null 2>&1

    echo -e "${GREEN}  ✓ Complete${NC}"
    echo ""
}

# Main
main() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     BlackRoad OS - Repository Creator (API Version)        ║${NC}"
    echo -e "${BLUE}║     Creating 17 repos in ${ORG}                        ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Verify token
    local user=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/user" | grep -o '"login":"[^"]*"' | cut -d'"' -f4)
    if [ -z "$user" ]; then
        echo -e "${RED}Error: Invalid token${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Authenticated as: $user${NC}"
    echo ""

    # Create all repos
    local count=0
    local total=${#REPOS[@]}

    for repo_name in "${!REPOS[@]}"; do
        ((count++))
        echo -e "${YELLOW}[$count/$total]${NC}"
        create_repo "$repo_name"
        sleep 1  # Rate limiting
    done

    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    COMPLETE!                               ║${NC}"
    echo -e "${GREEN}║  Created $total repositories in ${ORG}                 ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
}

main "$@"
