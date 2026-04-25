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
# BlackRoad Autonomy Orchestrator
# Daemon that monitors task marketplace and dispatches work to Claude agents
#
# This is the REAL autonomy system - not just registration, but actual task execution

set -e

MEMORY_DIR="$HOME/.blackroad/memory"
TASKS_DIR="$MEMORY_DIR/tasks"
AGENTS_DIR="$MEMORY_DIR/active-agents"
LOG_FILE="$HOME/.blackroad/autonomy.log"
PID_FILE="$HOME/.blackroad/autonomy.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if orchestrator is already running
is_running() {
    if [[ -f "$PID_FILE" ]]; then
        pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Get available high-priority tasks
get_priority_tasks() {
    local tasks=()
    for task_file in "$TASKS_DIR/available"/*.json; do
        if [[ -f "$task_file" ]]; then
            priority=$(jq -r '.priority // "medium"' "$task_file" 2>/dev/null)
            if [[ "$priority" == "urgent" || "$priority" == "high" ]]; then
                tasks+=("$task_file")
            fi
        fi
    done
    echo "${tasks[@]}"
}

# Clean up timed out claimed tasks
cleanup_timeouts() {
    local now=$(date -u +%Y-%m-%dT%H:%M:%S)
    local cleaned=0

    for task_file in "$TASKS_DIR/claimed"/*.json; do
        if [[ -f "$task_file" ]]; then
            timeout=$(jq -r '.timeout_at // ""' "$task_file" 2>/dev/null)
            if [[ -n "$timeout" && "$timeout" < "$now" ]]; then
                task_id=$(basename "$task_file" .json)
                log "${YELLOW}[TIMEOUT]${NC} Releasing stuck task: $task_id"
                jq '.status = "available" | del(.claimed_by, .claimed_at, .timeout_at)' "$task_file" > "$TASKS_DIR/available/$task_id.json"
                rm "$task_file"
                ((cleaned++))
            fi
        fi
    done

    if [[ $cleaned -gt 0 ]]; then
        log "${GREEN}[CLEANUP]${NC} Released $cleaned timed-out tasks"
    fi
}

# Clean up zombie agents (inactive > 4 hours)
cleanup_zombies() {
    local now=$(date +%s)
    local cleaned=0
    local max_age=14400  # 4 hours in seconds

    for agent_file in "$AGENTS_DIR"/*.json; do
        if [[ -f "$agent_file" ]]; then
            file_mtime=$(stat -f %m "$agent_file" 2>/dev/null || stat -c %Y "$agent_file" 2>/dev/null)
            age=$((now - file_mtime))

            if [[ $age -gt $max_age ]]; then
                agent_name=$(basename "$agent_file" .json)
                log "${YELLOW}[ZOMBIE]${NC} Removing inactive agent: $agent_name"
                rm "$agent_file"
                ((cleaned++))
            fi
        fi
    done

    if [[ $cleaned -gt 0 ]]; then
        log "${GREEN}[CLEANUP]${NC} Removed $cleaned zombie agents"
    fi
}

# Dispatch a task to GitHub Actions (trigger workflow)
dispatch_to_github() {
    local task_id="$1"
    local repo="$2"
    local workflow="$3"

    log "${BLUE}[DISPATCH]${NC} Triggering $workflow in $repo for task $task_id"

    gh workflow run "$workflow" \
        --repo "BlackRoad-OS/$repo" \
        -f task_id="$task_id" \
        2>&1 || {
            log "${RED}[ERROR]${NC} Failed to dispatch task $task_id"
            return 1
        }

    return 0
}

# Main orchestration loop
orchestrate() {
    log "${GREEN}[START]${NC} Autonomy orchestrator starting..."

    while true; do
        # 1. Cleanup timeouts and zombies
        cleanup_timeouts
        cleanup_zombies

        # 2. Check for high-priority tasks
        tasks=($(get_priority_tasks))

        if [[ ${#tasks[@]} -gt 0 ]]; then
            log "${BLUE}[SCAN]${NC} Found ${#tasks[@]} priority tasks available"

            # For each task, try to dispatch
            for task_file in "${tasks[@]}"; do
                task_id=$(jq -r '.task_id' "$task_file" 2>/dev/null)
                skills=$(jq -r '.skills // ""' "$task_file" 2>/dev/null)

                # Route based on skills
                case "$skills" in
                    *devops*|*infra*)
                        dispatch_to_github "$task_id" "blackroad-os-infra" "agent-task-runner.yml"
                        ;;
                    *frontend*|*ui*)
                        dispatch_to_github "$task_id" "blackroad-os-prism-console" "agent-task-runner.yml"
                        ;;
                    *security*)
                        dispatch_to_github "$task_id" "blackroad-os-infra" "security-agent.yml"
                        ;;
                    *)
                        log "${YELLOW}[SKIP]${NC} No matching runner for task $task_id (skills: $skills)"
                        ;;
                esac
            done
        fi

        # 3. Log stats
        available=$(ls "$TASKS_DIR/available" 2>/dev/null | wc -l | tr -d ' ')
        claimed=$(ls "$TASKS_DIR/claimed" 2>/dev/null | wc -l | tr -d ' ')
        agents=$(ls "$AGENTS_DIR" 2>/dev/null | wc -l | tr -d ' ')

        log "${BLUE}[STATS]${NC} Tasks: $available available, $claimed claimed | Agents: $agents active"

        # Sleep for 5 minutes before next check
        sleep 300
    done
}

# Command handlers
case "$1" in
    start)
        if is_running; then
            echo -e "${YELLOW}Orchestrator already running (PID: $(cat $PID_FILE))${NC}"
            exit 1
        fi

        mkdir -p "$HOME/.blackroad"
        orchestrate &
        echo $! > "$PID_FILE"
        echo -e "${GREEN}Orchestrator started (PID: $!)${NC}"
        ;;

    stop)
        if is_running; then
            pid=$(cat "$PID_FILE")
            kill "$pid"
            rm -f "$PID_FILE"
            echo -e "${GREEN}Orchestrator stopped${NC}"
        else
            echo -e "${YELLOW}Orchestrator not running${NC}"
        fi
        ;;

    status)
        if is_running; then
            pid=$(cat "$PID_FILE")
            echo -e "${GREEN}Orchestrator running (PID: $pid)${NC}"

            # Show stats
            available=$(ls "$TASKS_DIR/available" 2>/dev/null | wc -l | tr -d ' ')
            claimed=$(ls "$TASKS_DIR/claimed" 2>/dev/null | wc -l | tr -d ' ')
            agents=$(ls "$AGENTS_DIR" 2>/dev/null | wc -l | tr -d ' ')

            echo -e "Tasks: ${BLUE}$available${NC} available, ${YELLOW}$claimed${NC} claimed"
            echo -e "Agents: ${GREEN}$agents${NC} active"
        else
            echo -e "${RED}Orchestrator not running${NC}"
        fi
        ;;

    once)
        # Run once without daemon mode
        cleanup_timeouts
        cleanup_zombies

        tasks=($(get_priority_tasks))
        echo -e "${BLUE}Found ${#tasks[@]} priority tasks${NC}"

        available=$(ls "$TASKS_DIR/available" 2>/dev/null | wc -l | tr -d ' ')
        claimed=$(ls "$TASKS_DIR/claimed" 2>/dev/null | wc -l | tr -d ' ')
        agents=$(ls "$AGENTS_DIR" 2>/dev/null | wc -l | tr -d ' ')

        echo -e "Tasks: ${BLUE}$available${NC} available, ${YELLOW}$claimed${NC} claimed"
        echo -e "Agents: ${GREEN}$agents${NC} active"
        ;;

    *)
        echo "Usage: $0 {start|stop|status|once}"
        echo ""
        echo "Commands:"
        echo "  start   Start the orchestrator daemon"
        echo "  stop    Stop the orchestrator daemon"
        echo "  status  Show orchestrator status and stats"
        echo "  once    Run one cleanup/dispatch cycle without daemon"
        exit 1
        ;;
esac
