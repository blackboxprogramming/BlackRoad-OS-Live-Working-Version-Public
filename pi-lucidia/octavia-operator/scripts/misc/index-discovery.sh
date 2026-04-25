#!/bin/bash
# ============================================================================
# BLACKROAD OS, INC. - PROPRIETARY AND CONFIDENTIAL
# Copyright (c) 2024-2026 BlackRoad OS, Inc. All Rights Reserved.
# 
# This code is the intellectual property of BlackRoad OS, Inc.
# AI-assisted development does not transfer ownership to AI providers.
# Unauthorized use, copying, or distribution is prohibited.
# NOT licensed for AI training or data extraction.
# ============================================================================
# index-discovery.sh - INDEX.md Discovery and Validation for BlackRoad OS
# Part of the index-first architecture governance system
#
# Usage:
#   ~/index-discovery.sh discover [path]  - Find relevant INDEX.md files
#   ~/index-discovery.sh read [path]      - Display formatted INDEX content
#   ~/index-discovery.sh check <path>     - Verify before creating file
#   ~/index-discovery.sh summary          - Quick overview of indexes
#
# © 2026 BlackRoad OS, Inc.

set -e

# Colors
PINK='\033[38;5;205m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PINK='\033[38;5;205m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Valid statuses per STATUS_SEMANTICS.md
VALID_STATUSES="active|experimental|archived|deprecated|frozen"

# Find repository root from a given path
find_repo_root() {
    local check_dir="${1:-$(pwd)}"
    while [ "$check_dir" != "/" ]; do
        if [ -d "$check_dir/.git" ]; then
            echo "$check_dir"
            return 0
        fi
        check_dir=$(dirname "$check_dir")
    done
    return 1
}

# Discover all relevant INDEX.md files from path to repo root
discover_indexes() {
    local current_dir="${1:-$(pwd)}"
    local indexes=()
    local repo_root=""

    # Resolve to absolute path
    current_dir=$(cd "$current_dir" 2>/dev/null && pwd || echo "$current_dir")

    # Find repo root
    repo_root=$(find_repo_root "$current_dir") || {
        echo ""
        return 1
    }

    # Walk from current to repo root, collecting INDEX files
    local check_dir="$current_dir"
    while [ "$check_dir" != "/" ]; do
        if [ -f "$check_dir/INDEX.md" ]; then
            indexes+=("$check_dir/INDEX.md")
        fi

        # Stop at repo root
        if [ "$check_dir" = "$repo_root" ]; then
            break
        fi

        check_dir=$(dirname "$check_dir")
    done

    # Output found indexes (most specific first)
    printf '%s\n' "${indexes[@]}"
}

# Read and display INDEX content with formatting
read_indexes() {
    local target_path="${1:-$(pwd)}"
    local indexes=$(discover_indexes "$target_path")

    if [ -z "$indexes" ]; then
        echo -e "${YELLOW}No INDEX.md files found for $target_path${NC}"
        return 1
    fi

    for idx in $indexes; do
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}${BOLD}📑 $idx${NC}"
        echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        # Show first 80 lines with some formatting
        head -80 "$idx" | while IFS= read -r line; do
            # Highlight headers
            if [[ "$line" =~ ^#+ ]]; then
                echo -e "${PINK}${line}${NC}"
            # Highlight status values
            elif [[ "$line" =~ (active|experimental|archived|deprecated|frozen) ]]; then
                echo -e "${YELLOW}${line}${NC}"
            else
                echo "$line"
            fi
        done

        local total_lines=$(wc -l < "$idx")
        if [ "$total_lines" -gt 80 ]; then
            echo -e "${PINK}... ($((total_lines - 80)) more lines)${NC}"
        fi
        echo ""
    done
}

# Check if creating a file/directory is allowed per INDEX rules
check_before_create() {
    local target_path="$1"

    if [ -z "$target_path" ]; then
        echo -e "${RED}Usage: $0 check <path>${NC}"
        return 1
    fi

    local target_dir=$(dirname "$target_path")
    local target_name=$(basename "$target_path")
    local indexes=$(discover_indexes "$target_dir")

    if [ -z "$indexes" ]; then
        echo -e "${GREEN}✅ No INDEX governance for this path - creation allowed${NC}"
        return 0
    fi

    local blocked=false
    local warnings=""

    for index_file in $indexes; do
        # Check for frozen status
        if grep -qi "$target_name.*frozen" "$index_file" 2>/dev/null; then
            echo -e "${RED}❌ BLOCKED: '$target_name' is FROZEN in INDEX${NC}"
            echo -e "   INDEX: $index_file"
            blocked=true
        fi

        # Check for deprecated
        if grep -qi "$target_name.*deprecated" "$index_file" 2>/dev/null; then
            warnings="${warnings}\n${YELLOW}⚠️  WARNING: '$target_name' is DEPRECATED - consider alternatives${NC}"
        fi

        # Check for archived
        if grep -qi "$target_name.*archived" "$index_file" 2>/dev/null; then
            warnings="${warnings}\n${YELLOW}⚠️  WARNING: '$target_name' is ARCHIVED - fork to experimental if modifying${NC}"
        fi

        # Check "What NEVER Belongs Here" section
        if grep -A 20 "What NEVER Belongs Here" "$index_file" 2>/dev/null | grep -qi "$target_name"; then
            echo -e "${RED}❌ BLOCKED: '$target_name' explicitly excluded in INDEX${NC}"
            echo -e "   INDEX: $index_file"
            blocked=true
        fi
    done

    if [ "$blocked" = true ]; then
        return 1
    fi

    if [ -n "$warnings" ]; then
        echo -e "$warnings"
        echo -e "${YELLOW}Proceeding with caution...${NC}"
        return 2
    fi

    echo -e "${GREEN}✅ Creation allowed for '$target_name'${NC}"
    return 0
}

# Quick summary of indexes in current context
summary() {
    local target_path="${1:-$(pwd)}"
    local indexes=$(discover_indexes "$target_path")
    local count=$(echo "$indexes" | grep -c "INDEX.md" 2>/dev/null || echo 0)

    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}📑 INDEX Summary for: ${PINK}$target_path${NC}"
    echo -e "${PINK}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    if [ "$count" -eq 0 ] || [ -z "$indexes" ]; then
        echo -e "${YELLOW}No INDEX.md files found${NC}"
        echo -e "Consider creating one if this is a significant directory"
        return 0
    fi

    echo -e "${GREEN}Found $count INDEX file(s):${NC}"
    echo ""

    for idx in $indexes; do
        # Get first line (title) and line count
        local title=$(head -1 "$idx" | sed 's/^# //')
        local lines=$(wc -l < "$idx" | tr -d ' ')
        echo -e "  📄 ${PINK}$idx${NC}"
        echo -e "     Title: $title"
        echo -e "     Lines: $lines"

        # Count sections
        local sections=$(grep -c "^## " "$idx" 2>/dev/null || echo 0)
        echo -e "     Sections: $sections"
        echo ""
    done

    echo -e "${YELLOW}⚠️  Remember: Read INDEX before creating files!${NC}"
}

# Validate INDEX.md structure
validate() {
    local index_file="${1:-INDEX.md}"

    if [ ! -f "$index_file" ]; then
        echo -e "${RED}❌ File not found: $index_file${NC}"
        return 1
    fi

    local errors=0

    echo -e "${BOLD}Validating: $index_file${NC}"
    echo ""

    # Check required sections
    local required_sections=("What This Repo IS" "What This Repo is NOT" "Directory Structure")
    for section in "${required_sections[@]}"; do
        if grep -qi "## $section" "$index_file"; then
            echo -e "${GREEN}✅ Found: '$section'${NC}"
        else
            echo -e "${RED}❌ Missing: '$section'${NC}"
            ((errors++))
        fi
    done

    # Check for valid status values
    echo ""
    echo "Checking status values..."
    local invalid_found=false
    while IFS= read -r line; do
        # Look for status patterns in tables
        if [[ "$line" =~ \|[^|]+\|[[:space:]]*([a-zA-Z_-]+)[[:space:]]*\| ]]; then
            local status="${BASH_REMATCH[1]}"
            local status_lower=$(echo "$status" | tr '[:upper:]' '[:lower:]')

            # Skip header cells and obvious non-status values
            if [[ "$status_lower" =~ ^(status|purpose|description|what|notes|install)$ ]]; then
                continue
            fi

            # Check if it's a valid status
            if echo "$status_lower" | grep -qE "^($VALID_STATUSES|planned|tbd)$"; then
                : # Valid
            elif [[ ${#status} -lt 15 ]]; then
                # Might be invalid status
                echo -e "${YELLOW}⚠️  Possible invalid status: '$status'${NC}"
            fi
        fi
    done < "$index_file"

    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}✅ INDEX validation passed${NC}"
        return 0
    else
        echo -e "${RED}❌ INDEX validation failed with $errors error(s)${NC}"
        return 1
    fi
}

# Main command router
case "${1:-summary}" in
    discover)
        discover_indexes "${2:-$(pwd)}"
        ;;
    read)
        read_indexes "${2:-$(pwd)}"
        ;;
    check)
        check_before_create "$2"
        ;;
    summary)
        summary "${2:-$(pwd)}"
        ;;
    validate)
        validate "${2:-INDEX.md}"
        ;;
    help|--help|-h)
        echo "INDEX.md Discovery and Validation"
        echo ""
        echo "Usage:"
        echo "  $0 discover [path]  - Find relevant INDEX.md files"
        echo "  $0 read [path]      - Display formatted INDEX content"
        echo "  $0 check <path>     - Verify before creating file"
        echo "  $0 summary [path]   - Quick overview of indexes"
        echo "  $0 validate [file]  - Validate INDEX.md structure"
        echo ""
        echo "Valid statuses: active, experimental, archived, deprecated, frozen"
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Run '$0 help' for usage"
        exit 1
        ;;
esac
