#!/bin/bash

# create-issue.sh
# Quick issue creation from the command line
# 
# Usage:
#   ./create-issue.sh "Fix the login redirect bug"
#   ./create-issue.sh "Add dark mode toggle" --priority p1
#   ./create-issue.sh "Refactor auth module" --agent
#
# Requirements:
#   - GitHub CLI (gh) installed and authenticated
#   - Run from within a git repo

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
PRIORITY="P2"
LABELS="task"
AGENT_MODE=false
TITLE=""
BODY=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --priority|-p)
            PRIORITY="${2^^}"  # Uppercase
            shift 2
            ;;
        --agent|-a)
            AGENT_MODE=true
            LABELS="agent-task,automated"
            shift
            ;;
        --bug|-b)
            LABELS="bug"
            shift
            ;;
        --body)
            BODY="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 \"Issue title\" [options]"
            echo ""
            echo "Options:"
            echo "  --priority, -p <P0|P1|P2|P3>  Set priority (default: P2)"
            echo "  --agent, -a                   Mark as agent task"
            echo "  --bug, -b                     Mark as bug"
            echo "  --body \"text\"                 Add body text"
            echo ""
            echo "Examples:"
            echo "  $0 \"Fix login redirect\""
            echo "  $0 \"Add dark mode\" --priority p1"
            echo "  $0 \"Refactor auth\" --agent --priority p0"
            exit 0
            ;;
        *)
            if [[ -z "$TITLE" ]]; then
                TITLE="$1"
            fi
            shift
            ;;
    esac
done

# Validate
if [[ -z "$TITLE" ]]; then
    echo -e "${RED}Error: Issue title required${NC}"
    echo "Usage: $0 \"Issue title\" [options]"
    exit 1
fi

# Check gh is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) not installed${NC}"
    echo "Install: https://cli.github.com/"
    exit 1
fi

# Build the issue
echo -e "${YELLOW}Creating issue...${NC}"

# Add priority label
case $PRIORITY in
    P0) LABELS="$LABELS,p0-now" ;;
    P1) LABELS="$LABELS,p1-today" ;;
    P2) LABELS="$LABELS,p2-week" ;;
    P3) LABELS="$LABELS,p3-backlog" ;;
esac

# Construct title prefix
if [[ "$LABELS" == *"agent-task"* ]]; then
    FULL_TITLE="[AGENT] $TITLE"
elif [[ "$LABELS" == *"bug"* ]]; then
    FULL_TITLE="[BUG] $TITLE"
else
    FULL_TITLE="[TASK] $TITLE"
fi

# Create the issue
if [[ -n "$BODY" ]]; then
    ISSUE_URL=$(gh issue create --title "$FULL_TITLE" --body "$BODY" --label "$LABELS" 2>&1)
else
    ISSUE_URL=$(gh issue create --title "$FULL_TITLE" --body "Created via CLI" --label "$LABELS" 2>&1)
fi

echo -e "${GREEN}✅ Issue created${NC}"
echo "$ISSUE_URL"

# Extract issue number for convenience
ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oP '\d+$')
if [[ -n "$ISSUE_NUM" ]]; then
    echo ""
    echo -e "Branch name: ${YELLOW}issue-$ISSUE_NUM-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-' | head -c 30)${NC}"
fi
