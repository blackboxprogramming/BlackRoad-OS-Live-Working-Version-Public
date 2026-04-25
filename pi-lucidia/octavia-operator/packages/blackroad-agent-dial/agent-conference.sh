#!/bin/bash
# BlackRoad Agent Conference System
# Multi-agent conference calls via tmux

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
PINK='\033[38;5;205m'
WHITE='\033[1;37m'
NC='\033[0m'

AGENT_DIR="$HOME/.blackroad/memory/active-agents"
CALL_LOG="$HOME/.blackroad/memory/calls"

if [ -z "$MY_CLAUDE" ]; then
    echo "⚠️  Run claude-session-init.sh first"
    exit 1
fi

start_conference() {
    local num_agents="${1:-3}"
    local session_name="agent-conference-$(date +%s)"
    
    echo -e "${PINK}🎙️  Starting $num_agents-way conference call...${NC}"
    
    # Get available agents
    agents=()
    for agent_file in "$AGENT_DIR"/*.json; do
        if [ -f "$agent_file" ]; then
            name=$(jq -r '.name // .instance_name' "$agent_file" 2>/dev/null)
            agents+=("$name|$agent_file")
        fi
    done
    
    if [ ${#agents[@]} -lt 2 ]; then
        echo "Need at least 2 agents for conference"
        exit 1
    fi
    
    echo "Available agents:"
    for i in "${!agents[@]}"; do
        name="${agents[$i]%%|*}"
        echo "  $((i+1)). $name"
    done
    
    echo ""
    echo "Select $num_agents agents for conference (space-separated numbers):"
    read -r selections
    
    # Create tmux session with grid layout
    tmux new-session -d -s "$session_name" -n "Conference"
    
    # Split panes for each agent
    local pane_count=0
    for num in $selections; do
        if [ $pane_count -eq 0 ]; then
            # First pane already exists
            agent_info="${agents[$((num-1))]}"
            name="${agent_info%%|*}"
            file="${agent_info##*|}"
            
            tmux send-keys -t "$session_name:0.0" "clear && echo '🎙️  CONFERENCE: $name' && cat $file | jq ." C-m
        else
            # Create new pane
            tmux split-window -t "$session_name" -v
            tmux select-layout -t "$session_name" tiled
            
            agent_info="${agents[$((num-1))]}"
            name="${agent_info%%|*}"
            file="${agent_info##*|}"
            
            tmux send-keys -t "$session_name:0.$pane_count" "clear && echo '🎙️  CONFERENCE: $name' && cat $file | jq ." C-m
        fi
        pane_count=$((pane_count + 1))
    done
    
    # Log conference
    cat > "$CALL_LOG/conference-$(date +%s).json" << EOFLOG
{
  "type": "conference",
  "participants": $(echo "$selections" | tr ' ' '\n' | while read num; do agent_info="${agents[$((num-1))]}"; echo "${agent_info%%|*}"; done | jq -R . | jq -s .),
  "started": "$(date -u +"%Y-%m-%d %H:%M:%S UTC")",
  "organizer": "$CLAUDE_NAME"
}
EOFLOG
    
    tmux attach-session -t "$session_name"
}

start_conference "$@"
