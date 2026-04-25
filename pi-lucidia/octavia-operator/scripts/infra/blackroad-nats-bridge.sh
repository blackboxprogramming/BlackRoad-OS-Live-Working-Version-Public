#!/bin/bash
# BlackRoad NATS Bridge - subscribes to key channels and logs events
# Usage: ./blackroad-nats-bridge.sh [start|stop|status]
# Channels: blackroad.health, blackroad.tasks, blackroad.alerts, blackroad.deploy

set -e

PINK='\033[38;5;205m'
AMBER='\033[38;5;214m'
BLUE='\033[38;5;69m'
VIOLET='\033[38;5;135m'
GREEN='\033[38;5;82m'
RED='\033[38;5;196m'
RESET='\033[0m'

NATS_SERVER="192.168.4.97:4222"
LOG_DIR="$HOME/.blackroad/nats"
PID_FILE="$LOG_DIR/bridge.pid"
HEALTH_LOG="$LOG_DIR/health.log"
TASKS_LOG="$LOG_DIR/tasks.log"
ALERTS_LOG="$LOG_DIR/alerts.log"
DEPLOY_LOG="$LOG_DIR/deploy.log"
BRIDGE_LOG="$LOG_DIR/bridge.log"

mkdir -p "$LOG_DIR"

log() {
    echo -e "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$BRIDGE_LOG"
}

route_message() {
    # Route a NATS message line to the appropriate log based on subject
    local line="$1"
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Log everything to bridge log
    echo "[$timestamp] $line" >> "$BRIDGE_LOG"

    # Route to specific logs based on subject in the received line
    case "$line" in
        *blackroad.health*) echo "[$timestamp] $line" >> "$HEALTH_LOG" ;;
        *blackroad.tasks*)  echo "[$timestamp] $line" >> "$TASKS_LOG" ;;
        *blackroad.alerts*) echo "[$timestamp] $line" >> "$ALERTS_LOG" ;;
        *blackroad.deploy*) echo "[$timestamp] $line" >> "$DEPLOY_LOG" ;;
    esac
}

start_unified_subscriber() {
    nats sub "blackroad.>" --server="$NATS_SERVER" 2>&1 | while IFS= read -r line; do
        route_message "$line"
    done &
    echo $!
}

start() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo -e "${AMBER}Bridge is already running (PID $(cat "$PID_FILE"))${RESET}"
        exit 1
    fi

    log "${GREEN}Starting BlackRoad NATS Bridge...${RESET}"
    log "Server: $NATS_SERVER"

    # Test connectivity first
    if ! nats pub blackroad.bridge.startup "bridge started on $(hostname) at $(date)" --server="$NATS_SERVER" 2>/dev/null; then
        log "${RED}Cannot connect to NATS server at $NATS_SERVER${RESET}"
        exit 1
    fi

    # Single unified subscriber for all blackroad.> subjects
    SUB_PID=$(start_unified_subscriber)

    # Store PIDs
    echo "$$" > "$PID_FILE"
    echo "$SUB_PID" > "$LOG_DIR/sub_pids"

    log "${GREEN}Bridge started successfully${RESET}"
    log "  Subscriber PID: $SUB_PID (blackroad.>)"
    log "Logs: $LOG_DIR"

    # Wait for all background processes
    wait
}

stop() {
    if [ ! -f "$PID_FILE" ]; then
        echo -e "${AMBER}Bridge is not running${RESET}"
        exit 0
    fi

    MAIN_PID=$(cat "$PID_FILE")
    if [ -f "$LOG_DIR/sub_pids" ]; then
        SUB_PIDS=$(cat "$LOG_DIR/sub_pids")
        for pid in $SUB_PIDS; do
            kill "$pid" 2>/dev/null || true
        done
    fi
    kill "$MAIN_PID" 2>/dev/null || true

    # Also kill any lingering nats sub processes from this bridge
    pkill -f "nats sub blackroad\." 2>/dev/null || true

    rm -f "$PID_FILE" "$LOG_DIR/sub_pids"
    log "${AMBER}Bridge stopped${RESET}"
}

status() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo -e "${GREEN}Bridge is running (PID $(cat "$PID_FILE"))${RESET}"
        if [ -f "$LOG_DIR/sub_pids" ]; then
            echo -e "  Subscriber PIDs: $(cat "$LOG_DIR/sub_pids")"
        fi
        echo ""
        echo "Log sizes:"
        for f in "$HEALTH_LOG" "$TASKS_LOG" "$ALERTS_LOG" "$DEPLOY_LOG" "$BRIDGE_LOG"; do
            if [ -f "$f" ]; then
                lines=$(wc -l < "$f" 2>/dev/null || echo 0)
                echo "  $(basename "$f"): $lines lines"
            fi
        done
        echo ""
        echo "Last 5 bridge log entries:"
        tail -5 "$BRIDGE_LOG" 2>/dev/null || echo "  (empty)"
    else
        echo -e "${AMBER}Bridge is not running${RESET}"
        rm -f "$PID_FILE" 2>/dev/null
    fi
}

# Helper: publish to a channel
publish() {
    local channel="$1"
    shift
    local message="$*"
    nats pub "blackroad.$channel" "$message" --server="$NATS_SERVER"
}

case "${1:-}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    pub|publish)
        if [ -z "${2:-}" ] || [ -z "${3:-}" ]; then
            echo "Usage: $0 pub <channel> <message>"
            echo "  e.g.: $0 pub health '{\"host\":\"mac\",\"status\":\"ok\"}'"
            exit 1
        fi
        publish "$2" "${@:3}"
        ;;
    *)
        echo -e "${PINK}BlackRoad NATS Bridge${RESET}"
        echo ""
        echo "Usage: $0 {start|stop|status|pub}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the bridge daemon"
        echo "  stop    - Stop the bridge daemon"
        echo "  status  - Show bridge status"
        echo "  pub     - Publish to a channel"
        echo ""
        echo "Channels:"
        echo "  blackroad.health  - Health check events"
        echo "  blackroad.tasks   - Task marketplace"
        echo "  blackroad.alerts  - Alert notifications"
        echo "  blackroad.deploy  - Deployment events"
        exit 1
        ;;
esac
