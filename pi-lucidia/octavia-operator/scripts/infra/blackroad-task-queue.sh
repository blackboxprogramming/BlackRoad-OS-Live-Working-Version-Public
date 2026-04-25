#!/bin/bash
# BlackRoad Task Queue
# Distributed message queue for async task processing
# Agent: Icarus (b3e01bd9)

PINK='\033[38;5;205m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

QUEUE_DIR="$HOME/.blackroad/queue"
QUEUE_DB="$QUEUE_DIR/queue.db"
ALL_NODES=("lucidia" "cecilia" "octavia" "aria" "alice")

# Initialize
init() {
    mkdir -p "$QUEUE_DIR"/{dead-letter,results}

    sqlite3 "$QUEUE_DB" << 'SQL'
CREATE TABLE IF NOT EXISTS queues (
    name TEXT PRIMARY KEY,
    max_size INTEGER DEFAULT 10000,
    visibility_timeout INTEGER DEFAULT 30,
    retention_hours INTEGER DEFAULT 24,
    dead_letter_queue TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    queue TEXT,
    payload TEXT,
    priority INTEGER DEFAULT 0,
    delay_until DATETIME,
    visibility_timeout DATETIME,
    receive_count INTEGER DEFAULT 0,
    max_receives INTEGER DEFAULT 3,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME
);

CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    queue TEXT,
    node TEXT,
    status TEXT DEFAULT 'idle',
    last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
    messages_processed INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_queue ON messages(queue);
CREATE INDEX IF NOT EXISTS idx_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_priority ON messages(priority DESC);
SQL

    # Create default queues
    seed_queues

    echo -e "${GREEN}Task queue initialized${RESET}"
}

# Seed default queues
seed_queues() {
    sqlite3 "$QUEUE_DB" << 'SQL'
INSERT OR IGNORE INTO queues (name, max_size, visibility_timeout, retention_hours) VALUES
    ('default', 10000, 30, 24),
    ('inference', 5000, 300, 12),
    ('batch', 1000, 600, 48),
    ('priority', 100, 60, 6),
    ('dead-letter', 10000, 0, 168);
SQL
}

# Create queue
create_queue() {
    local name="$1"
    local max_size="${2:-10000}"
    local timeout="${3:-30}"
    local retention="${4:-24}"

    sqlite3 "$QUEUE_DB" "
        INSERT OR REPLACE INTO queues (name, max_size, visibility_timeout, retention_hours)
        VALUES ('$name', $max_size, $timeout, $retention)
    "

    echo -e "${GREEN}Queue created: $name${RESET}"
}

# Send message to queue
send() {
    local queue="$1"
    local payload="$2"
    local priority="${3:-0}"
    local delay="${4:-0}"

    local msg_id="msg_$(date +%s%N)_$(openssl rand -hex 4)"

    local delay_until="NULL"
    [ "$delay" -gt 0 ] && delay_until="datetime('now', '+$delay seconds')"

    sqlite3 "$QUEUE_DB" "
        INSERT INTO messages (id, queue, payload, priority, delay_until)
        VALUES ('$msg_id', '$queue', '$(echo "$payload" | sed "s/'/''/g")', $priority, $delay_until)
    "

    echo -e "${GREEN}Sent: $msg_id${RESET}"
    echo "$msg_id"
}

# Send batch messages
send_batch() {
    local queue="$1"
    local file="$2"

    local count=0
    while IFS= read -r payload; do
        [ -z "$payload" ] && continue
        send "$queue" "$payload" >/dev/null
        ((count++))
    done < "$file"

    echo -e "${GREEN}Sent $count messages to $queue${RESET}"
}

# Receive message from queue
receive() {
    local queue="$1"
    local visibility="${2:-30}"
    local wait="${3:-0}"

    local start=$(date +%s)

    while true; do
        # Get next available message
        local msg=$(sqlite3 "$QUEUE_DB" "
            SELECT id, payload, receive_count FROM messages
            WHERE queue = '$queue'
            AND status = 'pending'
            AND (delay_until IS NULL OR datetime(delay_until) <= datetime('now'))
            AND (visibility_timeout IS NULL OR datetime(visibility_timeout) <= datetime('now'))
            ORDER BY priority DESC, created_at ASC
            LIMIT 1
        ")

        if [ -n "$msg" ]; then
            local msg_id=$(echo "$msg" | cut -d'|' -f1)
            local payload=$(echo "$msg" | cut -d'|' -f2)
            local receive_count=$(echo "$msg" | cut -d'|' -f3)

            # Update visibility timeout
            sqlite3 "$QUEUE_DB" "
                UPDATE messages
                SET visibility_timeout = datetime('now', '+$visibility seconds'),
                    receive_count = receive_count + 1,
                    status = 'processing'
                WHERE id = '$msg_id'
            "

            echo "$msg_id|$payload"
            return 0
        fi

        # Long polling
        if [ "$wait" -gt 0 ]; then
            local elapsed=$(($(date +%s) - start))
            if [ "$elapsed" -lt "$wait" ]; then
                sleep 1
                continue
            fi
        fi

        return 1
    done
}

# Delete message (acknowledge)
delete() {
    local msg_id="$1"

    sqlite3 "$QUEUE_DB" "
        UPDATE messages SET status = 'completed', processed_at = datetime('now')
        WHERE id = '$msg_id'
    "

    echo -e "${GREEN}Deleted: $msg_id${RESET}"
}

# Return message to queue (nack)
nack() {
    local msg_id="$1"
    local delay="${2:-0}"

    local delay_until="NULL"
    [ "$delay" -gt 0 ] && delay_until="datetime('now', '+$delay seconds')"

    sqlite3 "$QUEUE_DB" "
        UPDATE messages
        SET status = 'pending', visibility_timeout = NULL, delay_until = $delay_until
        WHERE id = '$msg_id'
    "

    echo -e "${YELLOW}Returned to queue: $msg_id${RESET}"
}

# Move to dead letter queue
dead_letter() {
    local msg_id="$1"
    local reason="$2"

    local payload=$(sqlite3 "$QUEUE_DB" "SELECT payload FROM messages WHERE id = '$msg_id'")

    sqlite3 "$QUEUE_DB" "
        UPDATE messages SET status = 'dead-letter', queue = 'dead-letter' WHERE id = '$msg_id'
    "

    # Store reason
    echo "{\"original_id\":\"$msg_id\",\"reason\":\"$reason\",\"payload\":$payload}" > "$QUEUE_DIR/dead-letter/${msg_id}.json"

    echo -e "${RED}Moved to dead-letter: $msg_id${RESET}"
}

# Process messages that exceeded max receives
process_failed() {
    sqlite3 "$QUEUE_DB" "
        SELECT id FROM messages
        WHERE status = 'processing'
        AND receive_count >= max_receives
    " | while read -r msg_id; do
        dead_letter "$msg_id" "max_receives_exceeded"
    done
}

# List queues
list_queues() {
    echo -e "${PINK}=== QUEUES ===${RESET}"
    echo

    sqlite3 "$QUEUE_DB" "
        SELECT q.name, q.max_size, q.visibility_timeout,
               (SELECT COUNT(*) FROM messages m WHERE m.queue = q.name AND m.status = 'pending'),
               (SELECT COUNT(*) FROM messages m WHERE m.queue = q.name AND m.status = 'processing')
        FROM queues q ORDER BY q.name
    " | while IFS='|' read -r name max timeout pending processing; do
        printf "  %-15s pending:%-5d processing:%-5d (max:%d, timeout:%ds)\n" "$name" "$pending" "$processing" "$max" "$timeout"
    done
}

# Queue stats
stats() {
    local queue="${1:-all}"

    echo -e "${PINK}=== QUEUE STATISTICS ===${RESET}"
    echo

    local where=""
    [ "$queue" != "all" ] && where="WHERE queue = '$queue'"

    echo "Message counts:"
    sqlite3 "$QUEUE_DB" "
        SELECT queue, status, COUNT(*) FROM messages $where GROUP BY queue, status
    " | while IFS='|' read -r q status count; do
        printf "  %-15s %-12s %d\n" "$q" "$status" "$count"
    done

    echo
    echo "Processing rate (last hour):"
    sqlite3 "$QUEUE_DB" "
        SELECT queue, COUNT(*) FROM messages
        WHERE status = 'completed'
        AND datetime(processed_at, '+1 hour') > datetime('now')
        $where
        GROUP BY queue
    " | while IFS='|' read -r q count; do
        printf "  %-15s %d/hour\n" "$q" "$count"
    done
}

# Peek at messages (don't consume)
peek() {
    local queue="$1"
    local limit="${2:-5}"

    echo -e "${PINK}=== PEEK: $queue ===${RESET}"
    echo

    sqlite3 "$QUEUE_DB" "
        SELECT id, priority, receive_count, status, created_at, substr(payload, 1, 50)
        FROM messages WHERE queue = '$queue'
        ORDER BY priority DESC, created_at ASC
        LIMIT $limit
    " | while IFS='|' read -r id pri recv status created payload; do
        printf "  %s [P%d R%d] %s\n" "$id" "$pri" "$recv" "$status"
        echo "    ${payload}..."
    done
}

# Purge queue
purge() {
    local queue="$1"

    sqlite3 "$QUEUE_DB" "DELETE FROM messages WHERE queue = '$queue'"

    echo -e "${GREEN}Purged queue: $queue${RESET}"
}

# Worker daemon
worker() {
    local queue="${1:-default}"
    local handler="${2:-echo}"

    local worker_id="worker_$(hostname)_$$"

    sqlite3 "$QUEUE_DB" "
        INSERT OR REPLACE INTO workers (id, queue, node, status)
        VALUES ('$worker_id', '$queue', '$(hostname)', 'running')
    "

    echo -e "${PINK}╔══════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${PINK}║           ⚙️  QUEUE WORKER: $worker_id${RESET}"
    echo -e "${PINK}╚══════════════════════════════════════════════════════════════╝${RESET}"
    echo
    echo "Queue: $queue"
    echo "Handler: $handler"
    echo "Press Ctrl+C to stop"
    echo

    trap "sqlite3 '$QUEUE_DB' \"UPDATE workers SET status = 'stopped' WHERE id = '$worker_id'\"; exit" SIGINT SIGTERM

    local processed=0

    while true; do
        # Heartbeat
        sqlite3 "$QUEUE_DB" "
            UPDATE workers SET last_heartbeat = datetime('now'), messages_processed = $processed
            WHERE id = '$worker_id'
        "

        # Process failed messages
        process_failed

        # Receive message
        local msg=$(receive "$queue" 60 5)

        if [ -n "$msg" ]; then
            local msg_id=$(echo "$msg" | cut -d'|' -f1)
            local payload=$(echo "$msg" | cut -d'|' -f2-)

            echo "[$(date '+%H:%M:%S')] Processing $msg_id..."

            # Execute handler
            if eval "$handler" "'$payload'" >/dev/null 2>&1; then
                delete "$msg_id" >/dev/null
                ((processed++))
                echo "  ✓ Success"
            else
                nack "$msg_id" 30 >/dev/null
                echo "  ✗ Failed, returning to queue"
            fi
        fi
    done
}

# List workers
workers() {
    echo -e "${PINK}=== WORKERS ===${RESET}"
    echo

    sqlite3 "$QUEUE_DB" "
        SELECT id, queue, node, status, messages_processed, last_heartbeat FROM workers ORDER BY queue
    " | while IFS='|' read -r id queue node status processed heartbeat; do
        local status_color=$GREEN
        [ "$status" = "stopped" ] && status_color=$RED

        printf "  %-30s %-10s %-10s ${status_color}%-8s${RESET} %d msgs\n" "$id" "$queue" "$node" "$status" "$processed"
    done
}

# Clean old messages
cleanup() {
    local hours="${1:-24}"

    sqlite3 "$QUEUE_DB" "
        DELETE FROM messages
        WHERE status IN ('completed', 'dead-letter')
        AND datetime(processed_at, '+$hours hours') < datetime('now')
    "

    echo -e "${GREEN}Cleaned messages older than ${hours}h${RESET}"
}

# Help
help() {
    echo -e "${PINK}BlackRoad Task Queue${RESET}"
    echo
    echo "Distributed message queue for async processing"
    echo
    echo "Commands:"
    echo "  create-queue <name> [max] [timeout]  Create queue"
    echo "  send <queue> <payload> [pri] [delay] Send message"
    echo "  send-batch <queue> <file>            Send from file"
    echo "  receive <queue> [timeout] [wait]     Receive message"
    echo "  delete <msg_id>                      Acknowledge"
    echo "  nack <msg_id> [delay]                Return to queue"
    echo "  list-queues                          List queues"
    echo "  peek <queue> [limit]                 View messages"
    echo "  stats [queue]                        Statistics"
    echo "  worker <queue> [handler]             Start worker"
    echo "  workers                              List workers"
    echo "  purge <queue>                        Clear queue"
    echo "  cleanup [hours]                      Remove old"
    echo
    echo "Examples:"
    echo "  $0 send inference '{\"prompt\":\"hello\"}'"
    echo "  $0 worker inference 'python process.py'"
    echo "  $0 send priority 'urgent task' 10"
}

# Ensure initialized
[ -f "$QUEUE_DB" ] || init >/dev/null

case "${1:-help}" in
    init)
        init
        ;;
    create-queue|queue)
        create_queue "$2" "$3" "$4" "$5"
        ;;
    send|push|enqueue)
        send "$2" "$3" "$4" "$5"
        ;;
    send-batch|batch)
        send_batch "$2" "$3"
        ;;
    receive|pop|dequeue)
        receive "$2" "$3" "$4"
        ;;
    delete|ack)
        delete "$2"
        ;;
    nack|reject)
        nack "$2" "$3"
        ;;
    list-queues|queues)
        list_queues
        ;;
    peek|view)
        peek "$2" "$3"
        ;;
    stats)
        stats "$2"
        ;;
    worker|consume)
        worker "$2" "$3"
        ;;
    workers)
        workers
        ;;
    purge|clear)
        purge "$2"
        ;;
    cleanup|clean)
        cleanup "$2"
        ;;
    *)
        help
        ;;
esac
