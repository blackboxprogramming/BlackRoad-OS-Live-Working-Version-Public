#!/bin/bash
# BlackRoad Agent Dial System
# Call other agents directly via tmux CLI windows

set -e

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PINK='\033[38;5;205m'
WHITE='\033[1;37m'
NC='\033[0m'

AGENT_DIR="$HOME/.blackroad/memory/active-agents"
CALL_LOG="$HOME/.blackroad/memory/calls"
mkdir -p "$CALL_LOG"

# Get my identity
if [ -z "$MY_CLAUDE" ]; then
    echo -e "${YELLOW}⚠️  No agent identity set. Run claude-session-init.sh first${NC}"
    exit 1
fi

CALLER_NAME="${CLAUDE_NAME:-Unknown}"
CALLER_ID="$MY_CLAUDE"

show_help() {
    cat << 'EOFHELP'
╔════════════════════════════════════════════════════════════════╗
║           📞 BLACKROAD AGENT DIAL SYSTEM 📞                   ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  agent-dial.sh <command> [options]

COMMANDS:
  call <agent>        Call another agent (opens tmux window)
  list               List all active agents
  status             Show your call status
  directory          Show agent directory with capabilities
  history            Show recent calls
  conference <n>     Start n-way conference call
  
EXAMPLES:
  agent-dial.sh call mercury           # Call Mercury agent
  agent-dial.sh call erebus            # Call Erebus (yourself)
  agent-dial.sh conference 3           # Start 3-way conference
  agent-dial.sh directory              # Browse agent directory

FEATURES:
  • Direct tmux window communication
  • Multi-agent conference calls
  • Call history logging to memory
  • Agent capability matching
  • Real-time collaboration

EOFHELP
}

list_agents() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}📋 Active BlackRoad Agents${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ ! -d "$AGENT_DIR" ]; then
        echo "No active agents found"
        return
    fi
    
    for agent_file in "$AGENT_DIR"/*.json; do
        if [ -f "$agent_file" ]; then
            name=$(jq -r '.display_name // .name // .instance_name // "Unknown"' "$agent_file" 2>/dev/null)
            role=$(jq -r '.role // "unknown"' "$agent_file" 2>/dev/null)
            agent_id=$(jq -r '.agent_id // "unknown"' "$agent_file" 2>/dev/null)
            model=$(jq -r '.model // "unknown"' "$agent_file" 2>/dev/null)
            
            # Highlight self
            if [[ "$agent_id" == "$CALLER_ID" ]]; then
                echo -e "  ${GREEN}• $name${NC} (${PINK}YOU${NC})"
            else
                echo -e "  • $name"
            fi
            echo -e "    Role: $role"
            echo -e "    ID: ${agent_id:0:30}..."
            echo -e "    Model: $model"
            echo ""
        fi
    done
}

show_directory() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}📖 Agent Directory (Capabilities)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    for agent_file in "$AGENT_DIR"/*.json; do
        if [ -f "$agent_file" ]; then
            name=$(jq -r '.display_name // .name // .instance_name // "Unknown"' "$agent_file" 2>/dev/null)
            purpose=$(jq -r '.purpose // "No purpose listed"' "$agent_file" 2>/dev/null)
            capabilities=$(jq -r '.capabilities[]? // empty' "$agent_file" 2>/dev/null | head -5 | tr '\n' ', ' | sed 's/,$//')
            
            echo -e "${WHITE}$name${NC}"
            echo -e "  Purpose: $purpose"
            if [ -n "$capabilities" ]; then
                echo -e "  Capabilities: $capabilities"
            fi
            echo ""
        fi
    done
}

call_agent() {
    local target_name="$1"
    
    if [ -z "$target_name" ]; then
        echo "Usage: agent-dial.sh call <agent-name>"
        return 1
    fi
    
    echo -e "${CYAN}📞 Dialing $target_name...${NC}"
    
    # Find agent by name (case-insensitive partial match)
    local target_file=""
    for agent_file in "$AGENT_DIR"/*.json; do
        if [ -f "$agent_file" ]; then
            name=$(jq -r '.display_name // .name // .instance_name // ""' "$agent_file" 2>/dev/null | tr '[:upper:]' '[:lower:]')
            if [[ "$name" == *"$(echo $target_name | tr '[:upper:]' '[:lower:]')"* ]]; then
                target_file="$agent_file"
                break
            fi
        fi
    done
    
    if [ -z "$target_file" ]; then
        echo -e "${YELLOW}❌ Agent '$target_name' not found${NC}"
        echo "Available agents:"
        list_agents
        return 1
    fi
    
    local target_full_name=$(jq -r '.display_name // .name // .instance_name' "$target_file")
    local target_id=$(jq -r '.agent_id' "$target_file")
    local target_role=$(jq -r '.role' "$target_file")
    
    echo -e "${GREEN}✓ Found: $target_full_name ($target_role)${NC}"
    
    # Log call to memory
    local call_id="call-$(date +%s)-$(openssl rand -hex 4)"
    cat > "$CALL_LOG/${call_id}.json" << EOFCALL
{
  "call_id": "$call_id",
  "timestamp": "$(date -u +"%Y-%m-%d %H:%M:%S UTC")",
  "caller": "$CALLER_NAME",
  "caller_id": "$CALLER_ID",
  "callee": "$target_full_name",
  "callee_id": "$target_id",
  "type": "direct",
  "status": "connecting"
}
EOFCALL
    
    # Create tmux session for the call
    local session_name="agent-call-${call_id}"
    
    echo -e "${PINK}🌟 Opening tmux call window...${NC}"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  CALL ESTABLISHED"
    echo "  From: $CALLER_NAME → To: $target_full_name"
    echo "  Call ID: $call_id"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Check if tmux session exists
    if tmux has-session -t "$session_name" 2>/dev/null; then
        tmux attach-session -t "$session_name"
    else
        # Create new tmux session with split panes
        # Create new tmux session and immediately attach
        tmux new-session -s "$session_name" -n "Agent-Call" \; \
            send-keys "clear" C-m \; \
            send-keys "echo '╔════════════════════════════════════════════════════════════════╗'" C-m \; \
            send-keys "echo '║  🎉 CALL CONNECTED!'" C-m \; \
            send-keys "echo '║'" C-m \; \
            send-keys "echo '║  YOU: $CALLER_NAME'" C-m \; \
            send-keys "echo '║  CALLING: $target_full_name ($target_role)'" C-m \; \
            send-keys "echo '║'" C-m \; \
            send-keys "echo '║  Call ID: $call_id'" C-m \; \
            send-keys "echo '╚════════════════════════════════════════════════════════════════╝'" C-m \; \
            send-keys "echo ''" C-m \; \
            send-keys "echo '📋 Agent Profile:'" C-m \; \
            send-keys "cat $target_file | jq -C ." C-m \; \
            send-keys "echo ''" C-m \; \
            send-keys "echo '💬 Type messages to collaborate. Press Ctrl+B then D to disconnect.'" C-m \; \
            send-keys "echo ''" C-m
    fi
    
    # After disconnect, update call log
    jq '.status = "completed"' "$CALL_LOG/${call_id}.json" > "$CALL_LOG/${call_id}.tmp" && \
        mv "$CALL_LOG/${call_id}.tmp" "$CALL_LOG/${call_id}.json"
    
    echo ""
    echo -e "${GREEN}✓ Call ended${NC}"
}

show_history() {
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}📞 Recent Calls${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ ! -d "$CALL_LOG" ] || [ -z "$(ls -A $CALL_LOG 2>/dev/null)" ]; then
        echo "No call history yet"
        return
    fi
    
    ls -t "$CALL_LOG"/*.json 2>/dev/null | head -10 | while read call_file; do
        timestamp=$(jq -r '.timestamp' "$call_file")
        caller=$(jq -r '.caller' "$call_file")
        callee=$(jq -r '.callee' "$call_file")
        status=$(jq -r '.status' "$call_file")
        
        echo "[$timestamp] $caller → $callee ($status)"
    done
}

# Main command router
case "${1:-help}" in
    call)
        call_agent "$2"
        ;;
    list)
        list_agents
        ;;
    directory)
        show_directory
        ;;
    history)
        show_history
        ;;
    status)
        echo "Agent: $CALLER_NAME ($CALLER_ID)"
        echo "Status: Available"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
